from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from fastapi import HTTPException


from auth import hash_password, verify_password, create_access_token, decode_access_token
from models import User, Task ,TaskBase ,Media, MediaBase # <-- assuming Task is moved here too
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from fastapi import Depends, Request
from sqlmodel import select
import os



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

# SQLite engine (can switch to Postgres later)
sqlite_file_name = os.getenv("DATABASE_URL", "database.db")
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

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

@app.post("/media/")
def create_media(media: MediaBase, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        new_media = Media(**media.dict(), user_id=current_user.id, last_edited=datetime.now())
        session.add(new_media)
        session.commit()
        session.refresh(new_media)
        return new_media

@app.get("/media/")
def get_media(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Media).where(Media.user_id == current_user.id)
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

@app.put("/media/{media_id}", response_model=Media)
def update_media(
    media_id: int,
    updated: MediaBase,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    media = session.get(Media, media_id)
    if not media or media.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Media item not found")

   # Check if progress has changed
    if updated.progress != media.progress:
        media.last_edited = datetime.now()

    # Update all fields from the incoming model
    media.name = updated.name
    media.category = updated.category
    media.status = updated.status
    media.progress = updated.progress

    session.add(media)
    session.commit()
    session.refresh(media)
    return media