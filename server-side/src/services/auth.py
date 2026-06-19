"""
Auth utilities — JWT token creation, verification, and FastAPI dependencies
for role-based access control.

Usage in routes:
    current_user: User = Depends(get_current_user)
    current_user: User = Depends(require_admin)
    current_user: User = Depends(require_admin_or_law_enforcer)
"""

import os
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..utils.database import get_db
from ..models.models import User

# ── Config ─────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-12345")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ── Security scheme (swagger "Authorize" button) ──────────
security = HTTPBearer()


# ── Token helpers ──────────────────────────────────────────
def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT.  Raises HTTPException on failure."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


# ── FastAPI dependencies ───────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Decodes the Bearer token and returns the corresponding User.
    Works for ANY authenticated user (all roles).
    """
    payload = decode_access_token(credentials.credentials)
    user_id: str | None = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Only allows admin users."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def require_admin_or_law_enforcer(
    current_user: User = Depends(get_current_user),
) -> User:
    """Allows admin users OR users whose role is 'law_enforcer'."""
    if current_user.is_admin:
        return current_user

    if getattr(current_user, "role", None) == "law_enforcer":
        return current_user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin or law enforcement privileges required",
    )
