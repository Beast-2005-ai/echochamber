import redis
import json
import time
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# 1. Load the local transformer model
print("Loading Transformer model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2') 
dimension = 384  # Embedding size for all-MiniLM-L6-v2

# 2. Initialize FAISS Index (IndexFlatL2 measures Euclidean distance)
print("Initializing FAISS index...")
cpu_index = faiss.IndexFlatL2(dimension)

# Optional GPU Acceleration wrapper
try:
    res = faiss.StandardGpuResources()
    index = faiss.index_cpu_to_gpu(res, 0, cpu_index)
    print("FAISS is utilizing GPU acceleration!")
except Exception:
    index = cpu_index
    print("FAISS running in CPU mode (fully optimized).")

# In-memory storage mapping FAISS ID -> Original Article Metadata
metadata_storage = {}
current_id = 0

# Redis Connection Setup
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def process_queue():
    global current_id
    print("\nListening for raw news on Redis...")
    
    while True:
        result = r.brpop('raw_news_queue', timeout=0)
        if result:
            queue_name, message = result
            data = json.loads(message)
            
            text_to_analyze = data['title']
            print(f"\n[+] Processing: {text_to_analyze}")
            
            # Generate the vector embedding & normalize for processing
            embedding = model.encode(text_to_analyze)
            vector_np = np.array([embedding]).astype('float32')
            
            # If we already have items in our index, look for matches
            if index.ntotal > 0:
                # Search the index for the top 1 closest match
                distances, indices = index.search(vector_np, k=1)
                closest_idx = indices[0][0]
                distance_score = distances[0][0]
                
                # Check if a valid match was found (FAISS returns -1 if empty or no match)
                if closest_idx != -1 and closest_idx in metadata_storage:
                    matched_article = metadata_storage[closest_idx]
                    
                    # Euclidean distance: 0.0 means identical text. 
                    # Generally, < 0.5 means a highly identical topic/story context.
                    if distance_score < 0.5:
                        print(f"    👉 Related Story Detected! (Distance: {distance_score:.4f})")
                        print(f"    👉 Original: {matched_article['title']}")
                        
                        if text_to_analyze != matched_article['title']:
                            print("    ⚠️ Alert: Text variance/mutation spotted within the trend!")
                    else:
                        print(f"    [-] Unique story thread (Closest distance: {distance_score:.4f})")
            
            # Add the new vector to our FAISS index
            index.add(vector_np)
            
            # Save the metadata tied to this structural ID
            metadata_storage[current_id] = {
                "title": text_to_analyze,
                "url": data['url'],
                "published": data['published'],
                "source": data['source']
            }
            current_id += 1

if __name__ == "__main__":
    try:
        r.ping()
        process_queue()
    except redis.ConnectionError:
        print("Failed to connect to Redis. Is the container running?")
    except KeyboardInterrupt:
        print("\nStopping ML analyzer...")