from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..schemas import TaskCreate, TaskUpdate
from ..crud import create_task, update_task, delete_task
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/")
def create_new_task(task: TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return create_task(db, task, current_user.id)

@router.put("/{task_id}")
def update_existing_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return update_task(db, task_id, task)

@router.delete("/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return delete_task(db, task_id)