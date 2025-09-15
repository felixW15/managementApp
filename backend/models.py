from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
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

class TagCreate(SQLModel):
    name: str

class MediaBase(SQLModel):
    name: str
    category: str
    status: str
    progress: int
    rating: int = 0
    tags: List[TagCreate] = []

class MediaTagLink(SQLModel, table=True):
    media_id: Optional[int] = Field(default=None, foreign_key="media.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    media: List["Media"] = Relationship(back_populates="tags", link_model=MediaTagLink)

class Media(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str  # e.g. book, manga, anime, series
    status: str  # e.g. in progress, completed, dropped
    progress: int = 0
    rating: int = Field(default=0, ge=0, le=20)
    last_edited: datetime
    user_id: int = Field(foreign_key="user.id")
    tags: List[Tag] = Relationship(back_populates="media", link_model=MediaTagLink)

class TagRead(SQLModel):
    id: int
    name: str

class MediaRead(SQLModel):
    id: int
    name: str
    category: str
    status: str
    progress: int
    rating: int
    last_edited: datetime
    user_id: int
    tags: List[TagRead] = []   # include tags here