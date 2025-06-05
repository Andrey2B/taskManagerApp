from enum import Enum
from pydantic import BaseModel, EmailStr
from typing import Literal, Optional, List
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
    avatar: Optional[str] = None

    class Config:
        orm_mode = True


# --- Проекты ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    status: Optional[str] = "planning"  # Лучше сделать необязательным с дефолтом


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
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = "todo"  # статус по умолчанию


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None  # лучше int, чтобы связывать с User.id
    due_date: Optional[datetime] = None
    priority: Optional[str] = None  # low, medium, high, critical
    type: str  # marketing, development, design, research
    status: Optional[str] = "todo"  # добавлено поле status с дефолтом

    class Config:
        orm_mode = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    user_id: Optional[int] = None
    project_id: Optional[int] = None


class TaskOut(TaskBase):
    id: int
    user_id: Optional[int] = None
    project_id: int

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

class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    avatar: str


class PasswordChange(BaseModel):
    oldPassword: str
    newPassword: str


class TaskStatus(str, Enum):
    todo = 'todo'
    in_progress = 'in_progress'
    done = 'done'
    blocked = 'blocked'

class TaskPriority(str, Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'
    critical = 'critical'

class TaskType(str, Enum):
    marketing = 'marketing'
    development = 'development'
    design = 'design'
    research = 'research'

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignedTo: Optional[str] = None
    dueDate: Optional[str] = None
    priority: Optional[TaskPriority] = None
    type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None

    class Config:
        orm_mode = True