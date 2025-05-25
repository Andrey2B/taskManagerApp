from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate):
    # Проверка, есть ли уже пользователь с таким email
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()  # Ищем по email
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user


def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.dict(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    for key, value in task.dict().items():
        if value is not None:
            setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

def assign_role(db: Session, user_role: schemas.UserRole):
    user = db.query(models.User).filter(models.User.username == user_role.username).first()
    if not user:
        return None
    # Логика назначения роли (упрощенно)
    return {"message": f"Role '{user_role.role}' assigned to user '{user_role.username}'"}

def get_user_roles(db: Session, username: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return []
    # Логика получения ролей (упрощенно)
    return ["user"]  # Пример