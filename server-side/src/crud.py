from sqlalchemy.orm import Session
from .models import User
from .schemas import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

#verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

#create a new user
def create_user(db: Session, user: UserCreate, is_admin: bool = False) -> User:
    hashed_password = hash_password(user.password)
    db_user = User (
        email=user.email,
        hashed_password=hashed_password,
        is_admin=is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

#get user by email
def get_user_by_email(db: Session, email:str):
    return db.query(User).filter(User.email == email).first()

#get user by id
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

#get all users
def get_all_users(db: Session):
    return db.query(User).all()

#update user 
def update_user(db: Session, user_id: int, **kwargs):
    db.query(User).filter(User.id == user_id).update(kwargs)
    db.commit()
    return get_user_by_id(db, user_id)

#delete user
def delete_user(db: Session, user_id: int):
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    
    
