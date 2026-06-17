import redis
import json
import time
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

print("Loading Transformer model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2') 
dimension = 384 

print("Initializing FAISS index...")
cpu_index = faiss.IndexFlatL2(dimension)

try:
    res = faiss.StandardGpuResources()
    index = faiss.index_cpu_to_gpu(res, 0, cpu_index)
    print("FAISS is utilizing GPU acceleration!")
except Exception:
    index = cpu_index
    print("FAISS running in CPU mode (fully optimized).")

metadata_storage = {}
current_id = 0

# Connect to Redis with health checks to prevent socket timeouts
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, health_check_interval=30)

def process_queue():
    global current_id
    print("\nListening for raw news on Redis...")
    
    while True:
        result = r.brpop('raw_news_queue', timeout=5)
        
        if result:
            queue_name, message = result
            data = json.loads(message)
            
            text_to_analyze = data['title']
            print(f"\n[+] Processing: {text_to_analyze}")
            
            embedding = model.encode(text_to_analyze)
            vector_np = np.array([embedding]).astype('float32')
            
            # Default state variables for the UI Feed
            is_mutation = False
            origin_title = None
            final_distance = 0.0
            
            if index.ntotal > 0:
                distances, indices = index.search(vector_np, k=1)
                closest_idx = indices[0][0]
                
                if closest_idx != -1 and closest_idx in metadata_storage:
                    final_distance = float(distances[0][0])
                    matched_article = metadata_storage[closest_idx]
                    origin_title = matched_article['title']
                    
                    # Mutation detection threshold
                    if final_distance < 0.5:
                        if text_to_analyze != matched_article['title']:
                            is_mutation = True
                            print("    ⚠️ Alert: Text variance/mutation spotted!")
                            
                            # Push to the dedicated mutation database
                            mutation_event = {
                                "original_title": matched_article['title'],
                                "mutated_title": text_to_analyze,
                                "distance_score": final_distance,
                                "timestamp": time.time()
                            }
                            r.lpush('mutation_alerts', json.dumps(mutation_event))
            
            # --- PUSH TO LIVE UI FEED ---
            feed_item = {
                "title": text_to_analyze,
                "origin_title": origin_title,
                "is_mutation": is_mutation,
                "distance_score": final_distance,
                "timestamp": time.time()
            }
            r.lpush('live_feed', json.dumps(feed_item))
            r.ltrim('live_feed', 0, 9) # Keep only the newest 10 items in memory
            
            # Save to FAISS and Metadata
            index.add(vector_np)
            metadata_storage[current_id] = {
                "title": text_to_analyze,
                "url": data.get('url', ''),
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