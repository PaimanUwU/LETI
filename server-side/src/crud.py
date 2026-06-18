import hashlib
import hmac
import os

from sqlalchemy.orm import Session
from sqlalchemy import func

from .models import Report, User, CrimeRecords
from .schemas import UserCreate, ReportCreate, CrimeRecordCreate

_PBKDF2_ITERATIONS = 100_000


# CRUD operations for users - create, read, update, delete, and authentication
# Simple, self-contained password hashing using Python's standard library.
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    return f"{salt.hex()}${hashed.hex()}"


# verify password by re-hashing the input and comparing to stored hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, expected_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(expected_hex)
    except ValueError:
        return False

    actual = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    return hmac.compare_digest(actual, expected)


# authenticate user by email and password
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# create a new user
def create_user(db: Session, user: UserCreate, is_admin: bool = False) -> User:
    hashed_password = hash_password(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password, is_admin=is_admin)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# get user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


# get user by id
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# get all users
def get_all_users(db: Session):
    return db.query(User).all()


# update user
def update_user(db: Session, user_id: int, **kwargs):
    db.query(User).filter(User.id == user_id).update(kwargs)
    db.commit()
    return get_user_by_id(db, user_id)


# delete user
def delete_user(db: Session, user_id: int):
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
