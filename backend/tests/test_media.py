import os
import pytest
from fastapi.testclient import TestClient
from main import app, init_db, engine
from sqlmodel import SQLModel

client = TestClient(app)


def setup_module(module):
    """Setup test database (PostgreSQL or fallback SQLite)."""
    test_db_url = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/managementappdb_test"
    )
    os.environ["DATABASE_URL"] = test_db_url

    # Drop and recreate tables fresh for each test run
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)


def register_and_login():
    """Helper to register and login a test user."""
    client.post("/register", params={"username": "mediauser", "password": "testpass"})
    response = client.post("/login", params={"username": "mediauser", "password": "testpass"})
    return response.json()["access_token"]


def test_create_media():
    token = register_and_login()
    response = client.post(
        "/media/",
        json={
            "name": "Test Show",
            "category": "Anime",
            "status": "in progress",
            "progress": 10
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Show"


def test_get_media():
    token = register_and_login()
    client.post(
        "/media/",
        json={"name": "Show A", "category": "Anime", "status": "completed", "progress": 100},
        headers={"Authorization": f"Bearer {token}"}
    )
    response = client.get("/media/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_update_media():
    token = register_and_login()
    create_resp = client.post(
        "/media/",
        json={"name": "Old Name", "category": "Book", "status": "in progress", "progress": 20},
        headers={"Authorization": f"Bearer {token}"}
    )
    media_id = create_resp.json()["id"]

    update_resp = client.put(
        f"/media/{media_id}",
        json={"name": "Updated Name", "category": "Book", "status": "completed", "progress": 100},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Name"
    assert update_resp.json()["progress"] == 100


def test_delete_media():
    token = register_and_login()
    create_resp = client.post(
        "/media/",
        json={"name": "To Delete", "category": "Game", "status": "in progress", "progress": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    media_id = create_resp.json()["id"]

    del_resp = client.delete(f"/media/{media_id}", headers={"Authorization": f"Bearer {token}"})
    assert del_resp.status_code == 200
    assert del_resp.json()["ok"] is True


def teardown_module(module):
    """Tear down test database (dispose connections)."""
    engine.dispose()
