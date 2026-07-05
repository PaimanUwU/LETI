"""
LETI API — FastAPI application entry point.

Routes are organised into dedicated modules under routes/ and
mounted here so main.py stays lean.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .utils.database import engine, Base
from .routes import ai, auth, cases, dashboard, reports, users

# ── Create tables ──────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ───────────────────────────────────────────
app = FastAPI(title="LETI API", version="1.0.0")

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ──────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(reports.router)
app.include_router(cases.router)


# ── Health check ───────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}
