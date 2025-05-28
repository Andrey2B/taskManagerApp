from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Пользователи ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        orm_mode = True

# --- Проекты ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    status: str  # статус проекта

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

# --- Задачи ---
class TaskBase(BaseModel):
    title: str
    description: str
    priority: int
    status: Optional[str] = "Поставлена"

class TaskCreate(TaskBase):
    project_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    project_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    status: str
    project_id: Optional[int]

    class Config:
        orm_mode = True

# --- Роли ---
class RoleCreate(BaseModel):
    name: str

class UserRole(BaseModel):
    name: str
    role: str
