from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- Пользователи ---
def create_user(db: Session, user: schemas.UserCreate):
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
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

# --- Проекты ---
def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        status=project.status or "planning",
        owner_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Добавляем владельца как участника с ролью "owner"
    association = models.ProjectUser(project_id=db_project.id, user_id=user_id, role="owner")
    db.add(association)
    db.commit()
    return db_project

def get_projects(db: Session, user_id: int):
    return db.query(models.Project).join(models.ProjectUser).filter(models.ProjectUser.user_id == user_id).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate, user_id: int):
    db_project = get_project(db, project_id)
    if not db_project or db_project.owner_id != user_id:
        return None
    for key, value in project.dict(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int, user_id: int):
    db_project = get_project(db, project_id)
    if not db_project or db_project.owner_id != user_id:
        return None
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

# --- Задачи ---
def create_task(db: Session, task: schemas.TaskCreate, user_id: int, project_id: int):
    # Сопоставляем поля из frontend DTO к модели:
    # assignedTo -> assigned_to_id
    # dueDate -> due_date
    db_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        type=task.type,
        user_id=user_id,  # <-- правильное имя поля
        project_id=project_id,
    )


    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    for key, value in task.dict(exclude_unset=True).items():
        # Если ключ assignedTo или dueDate, нужно переименовать в поля модели
        if key == "assignedTo":
            setattr(db_task, "assigned_to_id", value)
        elif key == "dueDate":
            setattr(db_task, "due_date", value)
        else:
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
    return {"message": "Task deleted"}

# --- Комментарии ---
def create_task_comment(db: Session, comment: schemas.TaskCommentCreate, user_id: int):
    db_comment = models.TaskComment(
        text=comment.text,
        task_id=comment.task_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- Пользователи ---
def create_user(db: Session, user: schemas.UserCreate):
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
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

# --- Проекты ---
def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        status=project.status or "planning",
        owner_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Добавляем владельца как участника с ролью "owner"
    association = models.ProjectUser(project_id=db_project.id, user_id=user_id, role="owner")
    db.add(association)
    db.commit()
    return db_project

def get_projects(db: Session, user_id: int):
    return db.query(models.Project).join(models.ProjectUser).filter(models.ProjectUser.user_id == user_id).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate, user_id: int):
    db_project = get_project(db, project_id)
    if not db_project or db_project.owner_id != user_id:
        return None
    for key, value in project.dict(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int, user_id: int):
    db_project = get_project(db, project_id)
    if not db_project or db_project.owner_id != user_id:
        return None
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}

# --- Задачи ---
def create_task(db: Session, task: schemas.TaskCreate, user_id: int, project_id: int):
    # Сопоставляем поля из frontend DTO к модели:
    # assignedTo -> assigned_to_id
    # dueDate -> due_date
    db_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        type=task.type,
        user_id=user_id,  # <-- правильное имя поля
        project_id=project_id,
    )


    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    for key, value in task.dict(exclude_unset=True).items():
        # Если ключ assignedTo или dueDate, нужно переименовать в поля модели
        if key == "assignedTo":
            setattr(db_task, "assigned_to_id", value)
        elif key == "dueDate":
            setattr(db_task, "due_date", value)
        else:
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
    return {"message": "Task deleted"}

# --- Комментарии ---
def create_task_comment(db: Session, comment: schemas.TaskCommentCreate, user_id: int):
    db_comment = models.TaskComment(
        text=comment.text,
        task_id=comment.task_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def change_user_password(db: Session, user_id: int, old_password: str, new_password: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not pwd_context.verify(old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Старый пароль неверен")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Пароль успешно изменён"}

def delete_user_account(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(user)
    db.commit()
    return {"message": "Аккаунт удалён"}

def set_user_avatar(db: Session, user_id: int, avatar_url: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.avatar = avatar_url
    db.commit()
    db.refresh(user)
    return user
