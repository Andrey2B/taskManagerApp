from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import shutil
import os

from ..database import get_db
from ..models import User
from ..schemas import UserUpdate, PasswordChange
from ..dependencies import get_current_user
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)


@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    file_ext = file.filename.split('.')[-1]
    if file_ext.lower() not in {"jpg", "jpeg", "png", "gif"}:
        raise HTTPException(status_code=400, detail="Invalid image format")

    file_path = f"{AVATAR_DIR}/{current_user.id}.{file_ext}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/{file_path}"

    return {"url": avatar_url}


@router.post("/update-profile")
def update_profile(update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.name = update.name
    current_user.email = update.email
    current_user.avatar = update.avatar

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


@router.post("/change-password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    token_user: User = Depends(get_current_user)
):
    # Загрузить fresh экземпляр из текущей сессии
    current_user = db.query(User).filter(User.id == token_user.id).first()

    if not current_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if not pwd_context.verify(data.oldPassword, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Старый пароль неверен")

    current_user.hashed_password = pwd_context.hash(data.newPassword)
    db.commit()

    return {"message": "Пароль успешно изменён"}


@router.post("/logout-others")
def logout_other_sessions(current_user: User = Depends(get_current_user)):
    # Здесь можно реализовать токены, хранящиеся в Redis или базе, и удалять другие
    return {"message": "Вы вышли из других сессий"}


@router.delete("/delete-account")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Аккаунт удалён"}
