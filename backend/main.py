from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_db, close_db
from routes import router

app = FastAPI(title="Todo App API")

# CORS configuration: allow the Expo/Metro dev server origins used in development.
# For local Expo (Metro) the origin is typically http://localhost:8081. Add others as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://localhost:19000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def read_root():
    return {"message": "Todo App API running. Visit /docs for interactive API docs."}

@app.on_event("startup")
async def startup_event():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
