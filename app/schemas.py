from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Пользователи ---

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    class Config:
        orm_mode = True  # Указывает на использование SQLAlchemy объектов


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        orm_mode = True  # Указывает на использование SQLAlchemy объектов


# --- Проекты ---

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    status: str  # Статус проекта (например, "active", "completed")


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # Убрал обязательность статуса для обновления


class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    members: List[UserOut]  # Указание участников проекта

    class Config:
        orm_mode = True  # Указывает на использование SQLAlchemy объектов


# --- Задачи ---

class TaskBase(BaseModel):
    title: str
    description: str
    priority: int
    status: Optional[str] = "Поставлена"  # Статус задачи по умолчанию


class TaskCreate(TaskBase):
    project_id: Optional[int] = None  # Опциональный id проекта для привязки


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
    created_at: datetime  # Добавлен атрибут для времени создания задачи
    updated_at: Optional[datetime]  # Добавлен атрибут для времени последнего обновления

    class Config:
        orm_mode = True  # Указывает на использование SQLAlchemy объектов


# --- Комментарии к задачам ---

class TaskCommentCreate(BaseModel):
    text: str
    task_id: int

    class Config:
        orm_mode = True


class TaskCommentOut(TaskCommentCreate):
    id: int
    created_at: datetime  # Добавлен атрибут для времени создания комментария

    class Config:
        orm_mode = True


# --- Роли пользователя в проекте ---

class UserRole(BaseModel):
    role: str  # Роль в проекте (например, "owner", "manager", "developer")
    user_id: int  # ID пользователя, которому назначена роль

    class Config:
        orm_mode = True


# --- Роллинг список для ответа о проекте с пользователями и задачами ---

class ProjectWithTasksAndUsers(ProjectOut):
    tasks: List[TaskOut]  # Список задач, связанных с проектом
    members: List[UserOut]  # Список участников проекта
