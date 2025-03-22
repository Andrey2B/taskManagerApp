from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..schemas import UserRole
from ..crud import assign_role, get_user_roles
from ..dependencies import get_db, get_current_user, is_admin

router = APIRouter(prefix="/roles", tags=["roles"])

@router.post("/assign")
def assign_user_role(user_role: UserRole, db: Session = Depends(get_db), current_user: models.User = Depends(is_admin)):
    return assign_role(db, user_role)

@router.get("/{username}")
def read_user_roles(username: str, db: Session = Depends(get_db), current_user: models.User = Depends(is_admin)):
    return {"username": username, "roles": get_user_roles(db, username)}