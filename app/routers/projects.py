from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_projects(db=db, user_id=current_user.id)

@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

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
