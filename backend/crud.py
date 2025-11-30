import database
from auth import get_password_hash, verify_password, create_access_token
from models import UserCreate, TodoCreate
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timedelta

async def create_user(user: UserCreate) -> dict:
    if database.db is None:
        raise RuntimeError("Database not connected")

    user_doc = {
        "_id": str(uuid4()),
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": get_password_hash(user.password),
        "created_at": datetime.utcnow()
    }
    await database.db.users.insert_one(user_doc)
    return user_doc

async def get_user_by_email(email: str) -> Optional[dict]:
    return await database.db.users.find_one({"email": email})

async def get_user_by_id(user_id: str) -> Optional[dict]:
    return await database.db.users.find_one({"_id": user_id})

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password")):
        return None
    return user

async def create_todo(user_id: str, todo: TodoCreate) -> dict:
    todo_doc = {
        "_id": str(uuid4()),
        "user_id": user_id,
        "title": todo.title,
        "description": todo.description,
        "completed": False,
        "created_at": datetime.utcnow()
    }
    await database.db.todos.insert_one(todo_doc)
    return todo_doc

async def list_todos(user_id: str) -> List[dict]:
    cursor = database.db.todos.find({"user_id": user_id}).sort("created_at", -1)
    return await cursor.to_list(length=100)

async def update_todo(user_id: str, todo_id: str, patch: dict) -> Optional[dict]:
    res = await database.db.todos.find_one_and_update({"_id": todo_id, "user_id": user_id}, {"$set": patch}, return_document=True)
    return res

async def delete_todo(user_id: str, todo_id: str) -> bool:
    res = await database.db.todos.delete_one({"_id": todo_id, "user_id": user_id})
    return res.deleted_count > 0
