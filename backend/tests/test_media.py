import os
import pytest
from fastapi.testclient import TestClient
from main import app, init_db
from sqlmodel import SQLModel
from datetime import datetime
from sqlmodel import SQLModel
from main import engine


client = TestClient(app)
def setup_module(module):
    """Setup test database."""
    if os.path.exists("test.db"):
        os.remove("test.db")
    init_db()  # This will create tables

def register_and_login():
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
    from main import engine  # import here to avoid circular issues
    engine.dispose()         # this closes all pooled connections
    if os.path.exists("test.db"):
        os.remove("test.db")