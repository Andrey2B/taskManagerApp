import os
from fastapi import Depends, HTTPException, logger, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import crud, models, database
import logging
# Настройки безопасности (в продакшене — из переменных окружения)
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")
ALGORITHM = "HS256"

# Используется FastAPI для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# Получение подключения к БД
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Получение текущего пользователя из токена
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Декодируем токен с использованием секретного ключа
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # sub - это email пользователя
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Ищем пользователя в базе по email
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Проверка: является ли пользователь админом
def is_admin(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    roles = crud.get_user_roles(db, current_user.name)
    if "admin" not in roles:
        raise HTTPException(status_code=403, detail="Only admin can perform this action")
    return current_user
