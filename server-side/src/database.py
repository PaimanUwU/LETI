# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# SQLite connection string
DATABASE_URL = "sqlite:///./test.db"

# Create the database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Session factory - like connection pool in Node.js
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models - any model inherits from this
Base = declarative_base()

# Dependency injection function (FastAPI pattern)
# This is called automatically for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()