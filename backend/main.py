from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine, Session
from fastapi import HTTPException

from auth import hash_password, verify_password, create_access_token, decode_access_token
from models import User, Task, TaskBase, Media, MediaBase, Tag, MediaRead
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from fastapi import Depends, UploadFile, File
from sqlmodel import select
from sqlalchemy.orm import selectinload, joinedload
import os
import csv
import io



app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    username = payload.get("sub")
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user


DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postpw99@localhost:5432/managementappdb"
    )
)
print(DATABASE_URL)

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)

# Create DB tables
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI 🚀"}

@app.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username
    }

@app.post("/register")
def register(username: str, password: str):
    with Session(engine) as session:
        user_exists = session.exec(select(User).where(User.username == username)).first()
        if user_exists:
            raise HTTPException(status_code=400, detail="Username already registered")
        user = User(username=username, hashed_password=hash_password(password))
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User registered successfully"}

@app.post("/login")
def login(username: str, password: str):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": user.username})
        return {"access_token": token, "token_type": "bearer"}

@app.post("/tasks/")
def create_task(task: Task, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        task.user_id = current_user.id
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

@app.get("/tasks/")
def get_tasks(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == current_user.id)
        tasks = session.exec(statement).all()
        return tasks
    
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
    return {"ok": True}

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    updated_task: TaskBase,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = updated_task.title
    task.description = updated_task.description
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.post("/media/", response_model=MediaRead)
def create_media(media: MediaBase, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        # find or create tags
        tag_objs = []
        for tag in media.tags:
            normalized = tag.name.strip().lower()
            existing = session.exec(select(Tag).where(Tag.name == normalized)).first()
            if not existing:
                existing = Tag(name=normalized)
                session.add(existing)
                session.commit()
                session.refresh(existing)
            tag_objs.append(existing)

        new_media = Media(
            name=media.name,
            category=media.category,
            status=media.status,
            progress=media.progress,
            rating=media.rating,
            last_edited=datetime.now(),
            user_id=current_user.id,
            tags=tag_objs,
        )

        session.add(new_media)
        session.commit()
        session.refresh(new_media)

        # 🔑 Re-query with eager load so tags are fetched before session closes
        db_media = session.exec(
            select(Media)
            .options(joinedload(Media.tags))   # force load relationship
            .where(Media.id == new_media.id)
        ).first()

        return db_media

@app.get("/media/", response_model=list[MediaRead])
def get_media(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        statement = (
            select(Media)
            .where(Media.user_id == current_user.id)
            .options(selectinload(Media.tags))   # eager load tags
        )
        media_list = session.exec(statement).all()
        return media_list

@app.delete("/media/{media_id}")
def delete_media(media_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    media = session.get(Media, media_id)
    if not media or media.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Media item not found")
    session.delete(media)
    session.commit()
    return {"ok": True}

@app.put("/media/{media_id}", response_model=MediaRead)
def update_media(
    media_id: int,
    updated: MediaBase,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    media = session.get(Media, media_id)
    if not media or media.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Media item not found")

    # Update timestamp if progress changed
    if updated.progress != media.progress:
        media.last_edited = datetime.now()

    # Update scalar fields
    media.name = updated.name
    media.category = updated.category
    media.status = updated.status
    media.progress = updated.progress
    media.total_episodes = updated.total_episodes
    media.rating = updated.rating

    # Update tags (handle objects instead of strings)
    tag_objs = []
    for tag_data in updated.tags:
        tag_name = tag_data.name.strip()
        tag = session.exec(select(Tag).where(Tag.name.ilike(tag_name))).first()
        if not tag:
            tag = Tag(name=tag_name)
            session.add(tag)
            session.commit()
            session.refresh(tag)
        tag_objs.append(tag)

    media.tags = tag_objs

    session.add(media)
    session.commit()
    session.refresh(media, attribute_names=["tags"])
    return media

STATUS_MAP = {
    "Geschaut": "completed",
    "Am Schauen": "in progress",
    "Abgebrochen": "dropped",
    "Wird noch geschaut": "plan to watch",
    "Gelesen": "completed",
    "Am Lesen": "in progress",
    "Wird noch gelesen": "plan to watch",
}

CATEGORY_MAP = {
    "Animeserie": "anime",
    "OVA": "anime",
    "ONA": "anime",
    "Movie": "movie",
    "Mangaserie": "manga",
    "Manga": "manga",
    "Manhwa": "manga",
    "Manhua": "manga",
}

SUBTYPE_OVERRIDES = {
    "Webtoon": "webtoon",
}

@app.post("/media/import")
async def import_media_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    created = 0
    with Session(engine) as session:
        for row in reader:
            name = row.get("name", "").strip()
            if not name:
                continue
            try:
                last_edited = datetime.fromisoformat(row.get("date", "").strip())
            except ValueError:
                last_edited = datetime.now()
            media = Media(
                name=name,
                category=SUBTYPE_OVERRIDES.get(row.get("subtype", "").strip(), CATEGORY_MAP.get(row.get("category", "").strip(), row.get("category", "").strip().lower())),
                status=STATUS_MAP.get(row.get("status", "").strip(), row.get("status", "").strip()),
                progress=int(row.get("progress_current") or 0),
                total_episodes=int(row["progress_total"]) if row.get("progress_total") else None,
                rating=int(row.get("rating") or 0) * 2,
                last_edited=last_edited,
                user_id=current_user.id,
                tags=[],
            )
            session.add(media)
            created += 1
        session.commit()
    return {"imported": created}
