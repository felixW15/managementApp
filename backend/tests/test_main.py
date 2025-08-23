from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine
import os
import pytest

from main import app

# Use a dedicated test database (adjust user/pw if needed)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://postgres:postpw99@localhost:5432/managementappdb_test"
)

# Create a separate engine just for testing
test_engine = create_engine(TEST_DATABASE_URL, echo=True)

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown_db():
    """Create fresh tables for testing, then drop them after tests."""
    SQLModel.metadata.drop_all(test_engine)   # Ensure clean slate
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)   # Cleanup after tests


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
