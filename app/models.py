from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Используем name вместо username
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(String)
    updated_at = Column(String)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(Integer)
    status = Column(String, default="поставлена")
    user_id = Column(Integer, ForeignKey("users.id"))