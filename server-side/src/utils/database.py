# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# SQLite connection string
DATABASE_URL = "sqlite:///./leti.db"

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
        # SQLite URL format: sqlite:///./leti.db
        db_path = DATABASE_URL.replace("sqlite:///", "")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # Add `role` column if it doesn't exist (added after initial schema)
        cur.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cur.fetchall()]
        if "role" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'")
            conn.commit()

        # Add `email` column to reports if it doesn't exist
        cur.execute("PRAGMA table_info(reports)")
        columns = [row[1] for row in cur.fetchall()]
        if "email" not in columns:
            cur.execute("ALTER TABLE reports ADD COLUMN email VARCHAR DEFAULT ''")
            conn.commit()

        # Add `type` column to reports if it doesn't exist
        cur.execute("PRAGMA table_info(reports)")
        columns = [row[1] for row in cur.fetchall()]
        if "type" not in columns:
            cur.execute("ALTER TABLE reports ADD COLUMN type VARCHAR DEFAULT 'theft_other'")
            conn.commit()

        # Add `category` column to reports if it doesn't exist
        cur.execute("PRAGMA table_info(reports)")
        columns = [row[1] for row in cur.fetchall()]
        if "category" not in columns:
            cur.execute("ALTER TABLE reports ADD COLUMN category VARCHAR DEFAULT 'property'")
            conn.commit()

        # Add `approval_status` column to reports if it doesn't exist
        cur.execute("PRAGMA table_info(reports)")
        columns = [row[1] for row in cur.fetchall()]
        if "approval_status" not in columns:
            cur.execute("ALTER TABLE reports ADD COLUMN approval_status VARCHAR DEFAULT 'pending'")
            conn.commit()

        # Ensure CHECK constraints exist on reports (gov-defined crime types + categories)
        cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='reports'")
        row = cur.fetchone()
        if row and row[0] and "ck_reports_gov_crime_type" not in (row[0] or ""):
            # SQLite can't ALTER ADD CONSTRAINT — recreate the table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS reports_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR NOT NULL,
                    email VARCHAR DEFAULT '',
                    phone_number VARCHAR NOT NULL,
                    category VARCHAR NOT NULL DEFAULT 'property'
                        CHECK(category IN ('assault','property')),
                    type VARCHAR NOT NULL CHECK(type IN (
                        'break_in','causing_injury','murder','rape',
                        'robbery_gang_armed','robbery_gang_unarmed',
                        'robbery_solo_armed','robbery_solo_unarmed',
                        'theft_other','theft_vehicle_lorry',
                        'theft_vehicle_motorcar','theft_vehicle_motorcycle'
                    )),
                    title VARCHAR NOT NULL,
                    description VARCHAR NOT NULL,
                    location VARCHAR NOT NULL,
                    approval_status VARCHAR DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("INSERT INTO reports_new SELECT * FROM reports")
            cur.execute("DROP TABLE reports")
            cur.execute("ALTER TABLE reports_new RENAME TO reports")
            conn.commit()

        # Add `case_id` column to reports if it doesn't exist
        cur.execute("PRAGMA table_info(reports)")
        columns = [row[1] for row in cur.fetchall()]
        if "case_id" not in columns:
            cur.execute("ALTER TABLE reports ADD COLUMN case_id INTEGER")
            conn.commit()

        # ── Cases table (recreate if old schema has report_id) ──
        cur.execute("PRAGMA table_info(cases)")
        case_cols = [row[1] for row in cur.fetchall()]
        need_recreate = "title" not in case_cols or "report_id" in case_cols

        if need_recreate:
            # Drop old cases table and recreate with new schema
            cur.execute("DROP TABLE IF EXISTS cases_old")
            if "report_id" in case_cols:
                cur.execute("ALTER TABLE cases RENAME TO cases_old")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR NOT NULL DEFAULT 'Untitled Case',
                    description VARCHAR DEFAULT '',
                    assigned_to INTEGER,
                    notes VARCHAR DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
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