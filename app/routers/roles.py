from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..schemas import UserRole
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/roles", tags=["roles"])

# Пока система ролей не реализована в моделях, это будет просто заглушка

@router.post("/assign")
def assign_user_role(
    user_role: UserRole,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # TODO: Реализовать назначение ролей через таблицу связей
    raise HTTPException(status_code=501, detail="Назначение ролей пока не реализовано")


@router.get("/{username}")
def read_user_roles(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # TODO: Реализовать получение ролей пользователя
    raise HTTPException(status_code=501, detail="Получение ролей пока не реализовано")
