import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# ─── Test Database Setup ──────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_taskflow.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ─── Helper ───────────────────────────────────────────────────────────────────

def register_and_login(username="testuser", email="test@example.com", password="secret123"):
    client.post("/users/register", json={
        "username": username,
        "email": email,
        "password": password,
        "full_name": "Test User",
    })
    response = client.post("/users/login", json={
        "username": username,
        "password": password,
    })
    data = response.json()
    return data["access_token"], data["user"]["id"]


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


# ─── Health Check ─────────────────────────────────────────────────────────────

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ─── User Registration ────────────────────────────────────────────────────────

def test_register_user_success():
    response = client.post("/users/register", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "strongpass",
        "full_name": "Alice Smith",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_username():
    client.post("/users/register", json={
        "username": "bob",
        "email": "bob@example.com",
        "password": "pass123",
    })
    response = client.post("/users/register", json={
        "username": "bob",
        "email": "different@example.com",
        "password": "pass123",
    })
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]


def test_register_duplicate_email():
    client.post("/users/register", json={
        "username": "carol",
        "email": "carol@example.com",
        "password": "pass123",
    })
    response = client.post("/users/register", json={
        "username": "carol2",
        "email": "carol@example.com",
        "password": "pass123",
    })
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


# ─── Login ────────────────────────────────────────────────────────────────────

def test_login_success():
    client.post("/users/register", json={
        "username": "dave",
        "email": "dave@example.com",
        "password": "mypassword",
    })
    response = client.post("/users/login", json={
        "username": "dave",
        "password": "mypassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "dave"


def test_login_wrong_password():
    client.post("/users/register", json={
        "username": "eve",
        "email": "eve@example.com",
        "password": "correct",
    })
    response = client.post("/users/login", json={
        "username": "eve",
        "password": "wrong",
    })
    assert response.status_code == 401


def test_login_nonexistent_user():
    response = client.post("/users/login", json={
        "username": "ghost",
        "password": "nopass",
    })
    assert response.status_code == 401


# ─── Task Creation ────────────────────────────────────────────────────────────

def test_create_task_success():
    token, _ = register_and_login()
    response = client.post("/tasks/", json={
        "title": "Fix login bug",
        "description": "Users can't log in on mobile",
        "priority": "high",
        "status": "todo",
    }, headers=auth_headers(token))
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Fix login bug"
    assert data["priority"] == "high"
    assert data["is_completed"] is False


def test_create_task_unauthenticated():
    response = client.post("/tasks/", json={"title": "Sneaky task"})
    assert response.status_code == 401


def test_create_task_with_invalid_assignee():
    token, _ = register_and_login()
    response = client.post("/tasks/", json={
        "title": "Assign to ghost",
        "assignee_id": 9999,
    }, headers=auth_headers(token))
    assert response.status_code == 404


# ─── Task Retrieval ───────────────────────────────────────────────────────────

def test_list_tasks():
    token, _ = register_and_login()
    client.post("/tasks/", json={"title": "Task A"}, headers=auth_headers(token))
    client.post("/tasks/", json={"title": "Task B"}, headers=auth_headers(token))
    response = client.get("/tasks/", headers=auth_headers(token))
    assert response.status_code == 200
    assert len(response.json()) >= 2


def test_get_single_task():
    token, _ = register_and_login()
    create_res = client.post("/tasks/", json={"title": "Single task"}, headers=auth_headers(token))
    task_id = create_res.json()["id"]
    response = client.get(f"/tasks/{task_id}", headers=auth_headers(token))
    assert response.status_code == 200
    assert response.json()["title"] == "Single task"


def test_get_nonexistent_task():
    token, _ = register_and_login()
    response = client.get("/tasks/99999", headers=auth_headers(token))
    assert response.status_code == 404


# ─── Task Update ─────────────────────────────────────────────────────────────

def test_update_task():
    token, _ = register_and_login()
    create_res = client.post("/tasks/", json={
        "title": "Old title",
        "status": "todo",
    }, headers=auth_headers(token))
    task_id = create_res.json()["id"]

    response = client.put(f"/tasks/{task_id}", json={
        "title": "New title",
        "status": "in_progress",
    }, headers=auth_headers(token))
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New title"
    assert data["status"] == "in_progress"


def test_update_task_unauthorized():
    token1, _ = register_and_login("user1", "user1@test.com")
    token2, _ = register_and_login("user2", "user2@test.com")

    create_res = client.post("/tasks/", json={"title": "User1 task"}, headers=auth_headers(token1))
    task_id = create_res.json()["id"]

    response = client.put(f"/tasks/{task_id}", json={"title": "Hijacked"}, headers=auth_headers(token2))
    assert response.status_code == 403


# ─── Task Completion ──────────────────────────────────────────────────────────

def test_mark_task_complete():
    token, _ = register_and_login()
    create_res = client.post("/tasks/", json={"title": "Finish report"}, headers=auth_headers(token))
    task_id = create_res.json()["id"]

    response = client.patch(f"/tasks/{task_id}/complete", headers=auth_headers(token))
    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True
    assert data["status"] == "done"


# ─── Task Deletion ────────────────────────────────────────────────────────────

def test_delete_task():
    token, _ = register_and_login()
    create_res = client.post("/tasks/", json={"title": "Delete me"}, headers=auth_headers(token))
    task_id = create_res.json()["id"]

    response = client.delete(f"/tasks/{task_id}", headers=auth_headers(token))
    assert response.status_code == 204

    get_res = client.get(f"/tasks/{task_id}", headers=auth_headers(token))
    assert get_res.status_code == 404


def test_delete_task_unauthorized():
    token1, _ = register_and_login("deluser1", "deluser1@test.com")
    token2, _ = register_and_login("deluser2", "deluser2@test.com")

    create_res = client.post("/tasks/", json={"title": "Mine"}, headers=auth_headers(token1))
    task_id = create_res.json()["id"]

    response = client.delete(f"/tasks/{task_id}", headers=auth_headers(token2))
    assert response.status_code == 403


# ─── Task Assignment ──────────────────────────────────────────────────────────

def test_assign_task_to_user():
    token1, _ = register_and_login("assigner", "assigner@test.com")
    _, user2_id = register_and_login("assignee", "assignee@test.com")

    response = client.post("/tasks/", json={
        "title": "Assigned task",
        "assignee_id": user2_id,
    }, headers=auth_headers(token1))
    assert response.status_code == 201
    assert response.json()["assignee_id"] == user2_id