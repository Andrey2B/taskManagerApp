from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..schemas import UserCreate, UserLogin
from ..crud import create_user, authenticate_user
from ..dependencies import get_db, get_current_user
from jose import jwt

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = jwt.encode({"sub": db_user.username}, "your-secret-key", algorithm="HS256")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user