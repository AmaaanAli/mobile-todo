from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    full_name: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {"example": {"email": "user@example.com", "full_name": "Alice"}}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TodoOut(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
