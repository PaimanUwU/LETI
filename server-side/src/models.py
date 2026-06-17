from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone_number = Column(String)
    title = Column(String)
    description = Column(String)
    location = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CrimeRecords(Base):
    __tablename__ = "crime_records"

    id = Column(Integer, primary_key=True, index=True)

    state = Column(String, index=True)
    district = Column(String, index=True)

    category = Column(String, index=True)
    crime_type = Column(String, index=True)

    date = Column(Date, index=True)
    crimes = Column(Integer)
