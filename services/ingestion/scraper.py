import feedparser
import redis
import json
import time

# Redis Connection Setup
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Target Reddit RSS (e.g., Technology news)
RSS_URL = "https://www.reddit.com/r/technology/new/.rss"

def fetch_and_publish():
    print(f"\nFetching data from {RSS_URL}...")
    feed = feedparser.parse(RSS_URL)
    
    new_items_count = 0
    
    for entry in feed.entries:
        url = entry.link
        
        # SISMEMBER checks if the URL already exists in our Redis Set 'seen_urls'
        if r.sismember('seen_urls', url):
            continue  # Already processed this item, skip it!
            
        payload = {
            "source": "reddit",
            "title": entry.title,
            "url": url,
            "published": entry.published
        }
        
        # 1. Add the URL to the 'seen_urls' Set so we never process it again
        r.sadd('seen_urls', url)
        
        # 2. Push to the actual raw news processing queue
        r.lpush('raw_news_queue', json.dumps(payload))
        
        print(f"   [+] Pushed new item: {entry.title[:50]}...")
        new_items_count += 1
        
    if new_items_count == 0:
        print("   [-] No new posts found since last check.")

if __name__ == "__main__":
    try:
        r.ping()
        print("Connected to Redis successfully!")
        
        # Optional: Clear out any leftover duplicate spam in the queue from the last run
        r.delete('raw_news_queue')
        
        while True:
            fetch_and_publish()
            print("Sleeping for 60 seconds...")
            time.sleep(60)
            
    except redis.ConnectionError:
        print("Failed to connect to Redis. Is the Docker container running?")
    except KeyboardInterrupt:
        print("\nStopping scraper...")