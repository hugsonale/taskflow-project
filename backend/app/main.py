from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import engine
from . import models
from .routes import users, tasks

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow API",
    description="A lightweight team task management platform",
    version="1.0.0",
)

# CORS — allow React dev server and production frontend
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Welcome to TaskFlow API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}