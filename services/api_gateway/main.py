from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import json

app = FastAPI(title="EchoChamber API")

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Allow React to fetch data without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "EchoChamber API is online"}

@app.get("/api/alerts")
def get_recent_mutations():
    # Grabs only the confirmed mutations
    raw_alerts = r.lrange('mutation_alerts', 0, 9)
    alerts = [json.loads(alert) for alert in raw_alerts]
    return {"status": "success", "count": len(alerts), "data": alerts}

@app.get("/api/feed")
def get_live_feed():
    # Grabs the live stream of everything passing through the ML pipeline
    raw_feed = r.lrange('live_feed', 0, 9)
    feed = [json.loads(item) for item in raw_feed]
    return {"status": "success", "count": len(feed), "data": feed}

if __name__ == "__main__":
    import uvicorn
    print("Starting API Gateway on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)