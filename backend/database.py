from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/todoapp")

client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        # If the URI includes a database name (e.g. mongodb://host:27017/dbname), use it.
        db_name = None
        if "/" in MONGO_URI:
            db_name = MONGO_URI.rsplit("/", 1)[-1].split("?", 1)[0] or None
        if db_name:
            db = client[db_name]
        else:
            # If no database name is provided in the URI, default to 'todoapp'
            # to avoid pymongo ConfigurationError from get_default_database().
            db = client['todoapp']
        # Debug info
        print(f"Connected to MongoDB URI={MONGO_URI}, using database='{db.name}'")
    except Exception:
        # ensure any connection setup errors are visible in logs
        import traceback
        traceback.print_exc()
        raise

async def close_db():
    global client
    if client:
        client.close()
