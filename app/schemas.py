from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

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
    status: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    members: List[UserOut]

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
    project_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# --- Комментарии ---

class TaskCommentCreate(BaseModel):
    text: str
    task_id: int

    class Config:
        orm_mode = True

class TaskCommentOut(TaskCommentCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Роль пользователя в проекте ---

class UserRole(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    role: str

    class Config:
        orm_mode = True

# --- Расширенный проект с задачами и пользователями ---

class ProjectWithTasksAndUsers(ProjectOut):
    tasks: List[TaskOut]
    members: List[UserOut]
