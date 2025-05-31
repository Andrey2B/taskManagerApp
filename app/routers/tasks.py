from typing import Optional, List
from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..schemas import TaskCreate, TaskUpdate, TaskOut
from ..crud import create_task, update_task, delete_task
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/")
def create_new_task(task: TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return create_task(db, task, current_user.id)

@router.put("/{task_id}")
def replace_existing_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    updated_task = update_task(db, task_id, task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@router.patch("/{task_id}")
def partial_update_task(
    task_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    assignedTo: Optional[str] = Form(None),
    dueDate: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    update_data = {}
    if title is not None:
        update_data['title'] = title
    if description is not None:
        update_data['description'] = description
    if assignedTo is not None:
        update_data['assignedTo'] = assignedTo
    if dueDate is not None:
        update_data['dueDate'] = dueDate
    if priority is not None:
        update_data['priority'] = priority
    if type is not None:
        update_data['type'] = type
    if status is not None:
        update_data['status'] = status

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    task_update = TaskUpdate(**update_data)

    updated_task = update_task(db, task_id, task_update)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return updated_task

@router.delete("/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = delete_task(db, task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return result

@router.get("/{task_id}", response_model=TaskOut)
def get_task_by_id(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# **Добавленный метод для получения списка задач**
@router.get("/", response_model=List[TaskOut])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return tasks
