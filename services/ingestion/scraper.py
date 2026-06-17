import feedparser
import redis
import json
import time

# Redis Connection Setup
# decode_responses=True automatically decodes byte strings to Python strings
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Target Reddit RSS (e.g., Technology news)
RSS_URL = "https://www.reddit.com/r/technology/new/.rss"

def fetch_and_publish():
    print(f"Fetching data from {RSS_URL}...")
    feed = feedparser.parse(RSS_URL)
    
    for entry in feed.entries[:5]: # Grab the latest 5 posts for the prototype
        payload = {
            "source": "reddit",
            "title": entry.title,
            "url": entry.link,
            "published": entry.published
        }
        
        # Push to a Redis List (LPUSH adds to the left/top of the list)
        r.lpush('raw_news_queue', json.dumps(payload))
        print(f"Pushed to Redis: {entry.title[:50]}...")

if __name__ == "__main__":
    try:
        # Quick connection test
        r.ping()
        print("Connected to Redis successfully!")
        
        while True:
            fetch_and_publish()
            print("Sleeping for 60 seconds...")
            time.sleep(60) # Poll every minute
            
    except redis.ConnectionError:
        print("Failed to connect to Redis. Is the Docker container running?")
    except KeyboardInterrupt:
        print("\nStopping scraper...")