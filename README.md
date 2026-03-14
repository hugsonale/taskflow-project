# ⚡ TaskFlow — Team Task Management Platform

A lightweight team task management platform (think Trello-lite) built to demonstrate **Continuous Integration (CI) in DevOps**. TaskFlow showcases a realistic full-stack project with automated testing, Docker containerisation, and a GitHub Actions CI pipeline.

---

## 📐 Architecture

```
taskflow-project/
├── backend/                  # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── main.py           # App entry point & CORS config
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── database.py       # DB connection & session factory
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── crud.py           # Database operations
│   │   └── routes/
│   │       ├── users.py      # Auth endpoints (register, login)
│   │       └── tasks.py      # Task CRUD endpoints
│   ├── tests/
│   │   └── test_api.py       # Pytest test suite (20+ tests)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                 # React + Axios
│   ├── src/
│   │   ├── App.js            # Root component & state management
│   │   ├── api.js            # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   ├── Login.js      # Login form
│   │   │   ├── Register.js   # Registration form
│   │   │   ├── TaskList.js   # Task grid with cards
│   │   │   └── TaskForm.js   # Create / edit task modal
│   │   └── __tests__/
│   │       └── components.test.js  # Jest + RTL test suite
│   ├── public/index.html
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI pipeline
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

| Tool    | Version  |
|---------|----------|
| Python  | 3.11+    |
| Node.js | 20+      |
| npm     | 9+       |
| Docker  | 24+ *(optional)* |

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taskflow-project.git
cd taskflow-project
```

---

### 2. Run the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**

- Interactive API docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

### 3. Run the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The React app will open at **http://localhost:3000**

> The frontend is pre-configured to proxy API requests to `http://localhost:8000`

---

## 🧪 Running Tests

### Backend Tests (Pytest)

```bash
cd backend
source venv/bin/activate

# Run all tests with verbose output
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --cov=app --cov-report=term-missing
```

**Test coverage includes:**
- Health check endpoint
- User registration (success, duplicate username, duplicate email)
- User login (success, wrong password, nonexistent user)
- Task creation (success, unauthenticated, invalid assignee)
- Task retrieval (list, single, not found)
- Task update (success, unauthorised)
- Task completion
- Task deletion (success, unauthorised)
- Task assignment to team members

### Frontend Tests (Jest + React Testing Library)

```bash
cd frontend

# Run all tests once (CI mode)
npm test

# Run in watch mode (development)
npm run test -- --watch
```

**Test coverage includes:**
- Login component renders all fields correctly
- Register component renders all fields correctly
- Navigation between Login and Register works
- TaskList renders tasks from props
- TaskList shows empty state correctly
- Task action buttons (complete, edit, delete) fire correct callbacks
- TaskForm renders in create and edit modes
- TaskForm calls onSubmit with correct form data

---

## 🐳 Running with Docker

### Using Docker Compose (recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services started:
| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:80    |
| Backend  | http://localhost:8000  |
| API Docs | http://localhost:8000/docs |

### Build images individually

```bash
# Backend
docker build -t taskflow-backend ./backend
docker run -p 8000:8000 taskflow-backend

# Frontend
docker build -t taskflow-frontend ./frontend
docker run -p 80:80 taskflow-frontend
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=sqlite:///./taskflow.db
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🔄 CI Pipeline — How It Works

The CI pipeline is defined in `.github/workflows/ci.yml` and runs automatically on every **push** or **pull request** to the `main` and `develop` branches.

### Pipeline Overview

```
Push / PR to main or develop
           │
           ▼
    ┌──────────────┐      ┌───────────────────┐
    │   Backend    │      │    Frontend        │
    │  (Python)    │      │   (Node.js)        │
    │              │      │                    │
    │ 1. Checkout  │      │ 1. Checkout        │
    │ 2. Python 11 │      │ 2. Node.js 20      │
    │ 3. pip ci    │      │ 3. npm ci          │
    │ 4. pytest    │      │ 4. npm test        │
    │              │      │ 5. npm run build   │
    └──────┬───────┘      └────────┬───────────┘
           │                       │
           └──────────┬────────────┘
                      ▼
              ┌───────────────┐
              │  Docker Build │
              │  Validation   │
              │               │
              │ Build backend │
              │ Build frontend│
              └──────┬────────┘
                     │
                     ▼
              ┌───────────────┐
              │  CI Summary   │
              │  ✅ or ❌     │
              └───────────────┘
```

### Pipeline Jobs

| Job | What it does |
|-----|-------------|
| `backend` | Sets up Python, installs deps, runs 20+ pytest tests |
| `frontend` | Sets up Node.js, installs deps, runs Jest tests, builds production bundle |
| `docker-build` | Validates that both Dockerfiles build without errors (runs after both tests pass) |
| `ci-summary` | Prints a summary report of all job outcomes |

### Key CI Features

- **Dependency caching** — `pip` and `npm` caches are preserved between runs for speed
- **Parallel jobs** — Backend and frontend run simultaneously, not sequentially
- **Build artifacts** — Production build is uploaded and available for 7 days
- **Failure artifacts** — Test database saved on failure for debugging
- **Conditional execution** — Docker build only runs if tests pass

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register a new user |
| POST | `/users/login` | Login and receive access token |
| GET | `/users/` | List all users |
| GET | `/users/{id}` | Get user by ID |

### Task Endpoints

> All task endpoints require `Authorization: Bearer <token>` header

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/` | List all tasks |
| POST | `/tasks/` | Create a new task |
| GET | `/tasks/{id}` | Get task by ID |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |
| PATCH | `/tasks/{id}/complete` | Mark task as completed |

### Example: Register & Create Task

```bash
# 1. Register
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123","full_name":"Alice Smith"}'

# 2. Login
curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 3. Create task (use token from login response)
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-1" \
  -d '{"title":"Fix the login bug","priority":"high","status":"todo"}'
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI 0.111 |
| Language | Python 3.11 |
| Database | SQLite |
| ORM | SQLAlchemy 2.0 |
| Password Hashing | passlib (bcrypt) |
| Frontend Framework | React 18 |
| HTTP Client | Axios |
| Backend Testing | Pytest |
| Frontend Testing | Jest + React Testing Library |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Web Server | Nginx (production frontend) |

---

## 📝 Notes for CI Demo

1. **Fork this repo** to your GitHub account
2. Push a change to `main` or open a pull request
3. Watch the Actions tab — all 4 jobs run automatically
4. Try breaking a test (`assert False`) to see the pipeline fail in red
5. Fix it and push again to see it go green

---

*Built to demonstrate CI/CD best practices in a realistic full-stack context.