# main.py
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt
from .database import engine, Base, get_db

from .ai_utils import (
    dashboard_summary,
    dashboard_stats,
    top_districts,
    crime_counts_by_category,
    monthly_trends,
    run_ml_prediction,
    generate_state_heatmap_predictions
)

from .schemas import (
    ReportResponse,
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    ReportCreate,
    CrimePredictionInput
)
from . import crud


Base.metadata.create_all(bind=engine)

app = FastAPI(title="LETI API", version="1.0.0")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-12345")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#create access token
def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#login user and return JWT token
@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token({
        "sub": str(db_user.id),
        "is_admin": db_user.is_admin
    })
    
    return {"access_token": token, "token_type": "bearer"}

#create user with admin privileges
@app.post("/api/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    return crud.create_user(db, user, is_admin=True)

#get all users (admin only)
@app.get("/api/users", response_model=list[UserResponse])
async def read_all_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

#get user by id
@app.get("/api/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

#delete user (admin only)
@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(db, user_id)
    return None

# AI dashboard endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return dashboard_stats()

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(limit: int = 10):
    return dashboard_summary(limit)

@app.get("/api/dashboard/top-districts")
async def get_top_districts(limit: int = 10):
    return top_districts(limit)

@app.get("/api/dashboard/crime-counts-by-category")
async def get_crime_counts_by_category(limit: int = 10):
    return crime_counts_by_category(limit)

@app.get("/api/dashboard/monthly-trends")
async def get_monthly_trends(district: str | None = None):
    return monthly_trends(district)

@app.post("/api/ai/predict")
def predict_crime(payload: CrimePredictionInput):
    """
    Clean, high-performance synchronous ML inference route.
    """
    res = run_ml_prediction(payload)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.get("/api/ai/heatmap")
def crime_heatmap(
    year: int,
    month: int
):
    """
    Returns predicted crime totals by state.

    Example:
    /api/ai/heatmap?year=2027&month=1
    """

    return generate_state_heatmap_predictions(
        year=year,
        month=month
    )

@app.get("/api/debug/predict-one")
def debug_predict():
    from .ai_utils import run_ml_prediction, CrimePredictionInput

    payload = CrimePredictionInput(
        district="batu pahat",
        category="property",
        type="theft_other",
        year=2023,
        month=1
    )

    return run_ml_prediction(payload)
    
    
#report endpoints
@app.post("/api/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    return crud.create_report(db, report)

@app.get("/api/reports", response_model=list[ReportResponse])
async def read_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)


@app.get("/health")
async def health():
    return {"status": "ok"}
