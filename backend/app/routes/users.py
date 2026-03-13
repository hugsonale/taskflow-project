from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    # Simple token: in production use JWT; for demo purposes user id encoded
    token = f"demo-token-{user.id}"
    return schemas.Token(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user),
    )


@router.get("/", response_model=List[schemas.UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user