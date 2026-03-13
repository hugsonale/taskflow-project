from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks_created = relationship("Task", foreign_keys="Task.creator_id", back_populates="creator")
    tasks_assigned = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="todo")  # todo, in_progress, done
    priority = Column(String(10), default="medium")  # low, medium, high
    is_completed = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)

    creator = relationship("User", foreign_keys=[creator_id], back_populates="tasks_created")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="tasks_assigned")