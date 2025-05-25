from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from .. import models
from ..schemas import UserCreate, UserLogin
from ..crud import create_user, authenticate_user
from ..dependencies import get_db, get_current_user
import os

from app import schemas

router = APIRouter(prefix="/users", tags=["users"])

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

def create_access_token(data: dict, expires_delta: timedelta = None):
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Аутентификация по email
    db_user = authenticate_user(db, user.email, user.password)  # Ищем пользователя по email
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Генерация токена
    token = create_access_token({"sub": db_user.email})  # Генерируем токен
    return {"token": token, "token_type": "bearer", "user": db_user}

@router.get("/me")
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
