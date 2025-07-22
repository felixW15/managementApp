from fastapi.testclient import TestClient
from main import app, init_db
import os
from sqlmodel import SQLModel
from main import engine
import pytest

client = TestClient(app)

def setup_module(module):
    """Setup test database."""
    if os.path.exists("test.db"):
        os.remove("test.db")
    init_db()  # This will create tables
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI 🚀"}

def test_register_and_login():
    username = "testuser"
    password = "testpassword"

    # Register
    response = client.post("/register", params={"username": username, "password": password})
    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"

    # Login
    response = client.post("/login", params={"username": username, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_create_and_get_task():
    SQLModel.metadata.create_all(engine)
    username = "taskuser"
    password = "taskpass"

    # Register
    client.post("/register", params={"username": username, "password": password})
    # Login
    response = client.post("/login", params={"username": username, "password": password})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create task
    task_data = {"title": "Test Task", "description": "Testing task"}
    response = client.post("/tasks/", json=task_data, headers=headers)
    assert response.status_code == 200
    created_task = response.json()
    assert created_task["title"] == "Test Task"

    # Get tasks
    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert any(task["title"] == "Test Task" for task in tasks)

def teardown_module(module):
    from main import engine  # import here to avoid circular issues
    engine.dispose()         # this closes all pooled connections
    if os.path.exists("test.db"):
        os.remove("test.db")