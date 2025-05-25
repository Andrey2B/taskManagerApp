from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str  # Используем name вместо username
    email: str
    password: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str  # Используем email для логина
    password: str

class TaskCreate(BaseModel):
    title: str
    description: str
    priority: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None

class RoleCreate(BaseModel):
    name: str

class UserRole(BaseModel):
    name: str
    role: str
