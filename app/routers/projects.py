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

# Получить участников проекта (с ролями)
@router.get("/{project_id}/users", response_model=List[schemas.UserRole])
def get_project_users(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    # Допустим, все участники проекта могут видеть участников
    # Если нужна строгая проверка владельца, раскомментируй:
    # if current_user.id != project.owner_id:
    #     raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому проекту")

    return [
        schemas.UserRole(
            id=member.id,
            name=member.name,
            avatar=member.avatar,
            role=association.role
        )
        for member in project.members
        for association in project.members_association
        if association.user_id == member.id
    ]