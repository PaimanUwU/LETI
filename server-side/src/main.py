# main.py
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from .database import engine, Base, get_db
from .schemas import ReportResponse, UserCreate, UserResponse, UserLogin, Token, ReportCreate, ReportResponse
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


# OAuth2 scheme for dependency injection. tokenUrl should point to the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependency to retrieve the current user from a bearer JWT token.

    Raises 401 if token is invalid/expired or user does not exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise credentials_exception
    return user

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

#report endpoints
@app.post("/api/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # current_user is required (token validated). You can add further authorization checks here.
    return crud.create_report(db, report)

@app.get("/api/reports", response_model=list[ReportResponse])
async def read_reports(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Require authentication to read reports
    return crud.get_reports(db)


@app.get("/health")
async def health():
    return {"status": "ok"}
