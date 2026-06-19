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

def _migrate():
    """Apply simple schema migrations for SQLite (ALTER TABLE is limited)."""
    import sqlite3
    try:
        # SQLite URL format: sqlite:///./test.db
        db_path = DATABASE_URL.replace("sqlite:///", "")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        # Add `role` column if it doesn't exist (added after initial schema)
        cur.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cur.fetchall()]
        if "role" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'")
            conn.commit()
        conn.close()
    except Exception:
        pass  # Table may not exist yet — create_all handles it


# Run migration before create_all
_migrate()


# Dependency injection function (FastAPI pattern)
# This is called automatically for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()