# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models import User
from .schemas import UserCreate, UserResponse
from . import crud

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="LETI API", version="1.0.0")

# CORS middleware - allows frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== USER ROUTES =====

# CREATE user
@app.post("/api/users", response_model=UserResponse, status_code=201)
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new admin user"""
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    return crud.create_user(db, user, is_admin=True)

# READ all users
@app.get("/api/users", response_model=list[UserResponse])
async def read_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    return crud.get_all_users(db)

# READ single user by id
@app.get("/api/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get a single user by ID"""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# DELETE user
@app.delete("/api/users/{user_id}", status_code=204)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(db, user_id)
    return None

# Health check
@app.get("/health")
async def health():
    """API health check"""
    return {"status": "ok"}


# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="LETI API")

# CORS middleware - allows frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE user (admin only for now)
@app.post("/api/users", response_model=UserResponse)
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    return crud.create_user(db, user, is_admin=True)

# READ all users
@app.get("/api/users", response_model=list[UserResponse])
async def read_all_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

# READ single user
@app.get("/api/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}