import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

# Получить все проекты пользователя
@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_projects(db=db, user_id=current_user.id)

# Создать новый проект
@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

# Обновить проект
@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    updated = crud.update_project(db=db, project_id=project_id, project=project, user_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Проект не найден или доступ запрещён")
    return updated

# Удалить проект
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    deleted = crud.delete_project(db=db, project_id=project_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Проект не найден или доступ запрещён")
    return {"message": "Проект удалён"}

# Получить один проект по ID
@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проект не найден или доступ запрещён")
    return project

# Получить участников проекта с ролями
@router.get("/{project_id}/users", response_model=List[schemas.UserRole])
def get_project_users(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Получаем проект по строковому ID
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    # Получаем участников проекта через промежуточную таблицу (project_user)
    members_association = db.query(models.ProjectUser).filter(models.ProjectUser.project_id == project_id).all()

    # Формируем список пользователей с их ролями
    users_with_roles = []
    for association in members_association:
        user = db.query(models.User).filter(models.User.id == association.user_id).first()
        if user:
            users_with_roles.append(
                schemas.UserRole(
                    id=user.id,
                    name=user.name,
                    avatar=user.avatar,
                    role=association.role  # Роль из таблицы ProjectUser
                )
            )

    return users_with_roles

@router.get("/{project_id}/tasks", response_model=List[schemas.TaskOut])
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Получаем проект
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    # Проверяем права доступа (если необходимо)
    if current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому проекту")

    # Получаем все задачи проекта
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    return tasks
