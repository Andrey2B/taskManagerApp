from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="user")
    projects = relationship("Project", secondary="project_user", back_populates="members")
    comments = relationship("TaskComment", back_populates="user")  # Связь с комментариями

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="planning")
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")
    members = relationship("User", secondary="project_user", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class ProjectUser(Base):
    __tablename__ = "project_user"
    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(Integer)
    status = Column(String, default="поставлена")
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    comments = relationship("TaskComment", back_populates="task")  # Связь с комментариями

class TaskComment(Base):
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="comments")
    user = relationship("User", back_populates="comments")  # Связь с пользователем
