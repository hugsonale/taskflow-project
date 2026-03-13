from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    hashed_password: str


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─── Task Schemas ─────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    creator_id: int
    creator: Optional[UserResponse] = None
    assignee: Optional[UserResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True