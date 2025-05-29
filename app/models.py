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
    avatar = Column(String, nullable=True)

    projects = relationship("Project", secondary="project_user", back_populates="members")
    tasks = relationship("Task", back_populates="user")

    # Добавляем обратную связь с ProjectUser
    project_users = relationship("ProjectUser", back_populates="user")  # Добавлено






class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="planning")
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")
    members = relationship("User", secondary="project_user", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

    # Добавляем связь с ассоциацией
    members_association = relationship("ProjectUser", back_populates="project")  # Добавлено
    project_users = relationship("ProjectUser", back_populates="project", cascade="all, delete-orphan")






class ProjectUser(Base):
    __tablename__ = "project_user"
    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role = Column(String)

    project = relationship("Project", back_populates="project_users")
    user = relationship("User", back_populates="project_users")




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

    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")



class TaskComment(Base):
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="comments")
    user = relationship("User")


