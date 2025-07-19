from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str

# Task model
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    priority_score: Optional[int] = 0
    user_id: Optional[int] = None

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None

class Media(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str  # e.g. book, manga, anime, series
    status: str  # e.g. in progress, completed, dropped
    progress: int = 0
    last_edited: datetime
    user_id: int = Field(foreign_key="user.id")

class MediaBase(SQLModel):
    name: str
    category: str
    status: str
    progress: int