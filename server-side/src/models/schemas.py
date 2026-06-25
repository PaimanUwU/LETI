from pydantic import BaseModel, EmailStr, constr
from datetime import datetime, date
from typing import Optional


# Request schema - what client sends
class UserCreate(BaseModel):
    email: EmailStr
    # enforce a minimum length; byte-length (72 bytes limit of bcrypt) is checked server-side
    password: constr(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Response schema - what API returns
class UserResponse(BaseModel):
    id: int
    email: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ReportCreate(BaseModel):
    name: str
    phone_number: str
    type: str
    title: str
    description: str
    location: str
    approval_status: Optional[str] = "pending"


class ReportResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    title: str
    description: str
    location: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class CrimePredictionInput(BaseModel):
    district: str
    category: str
    type: str
    year: int
    month: int


class StateHeatmapResponse(BaseModel):
    state: str
    predicted_crimes: float


# Crime record schemas
class CrimeRecordCreate(BaseModel):
    state: str
    district: str
    category: str
    crime_type: str
    date: date
    crimes: int


class CrimeRecordResponse(BaseModel):
    id: int
    state: str
    district: str
    category: str
    crime_type: str
    date: date
    crimes: int

    class Config:
        from_attributes = True
