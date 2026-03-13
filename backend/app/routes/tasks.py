from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """
    Simple auth: expects header 'Authorization: Bearer demo-token-{user_id}'
    In production, replace with proper JWT verification.
    """
    if not authorization or not authorization.startswith("Bearer demo-token-"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_id = int(authorization.split("demo-token-")[1])
        return user_id
    except (IndexError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/", response_model=List[schemas.TaskResponse])
def list_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return crud.get_tasks(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # Validate assignee exists if provided
    if task.assignee_id:
        assignee = crud.get_user(db, task.assignee_id)
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee user not found")
    return crud.create_task(db, task, creator_id=user_id)


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this task")
    updated = crud.update_task(db, task_id, task_update)
    return updated


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    crud.delete_task(db, task_id)


@router.patch("/{task_id}/complete", response_model=schemas.TaskResponse)
def mark_complete(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update = schemas.TaskUpdate(is_completed=True, status="done")
    return crud.update_task(db, task_id, update)