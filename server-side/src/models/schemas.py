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
    role: Optional[str] = "user"
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ReportCreate(BaseModel):
    name: str
    email: Optional[str] = ""
    phone_number: str
    category: str = "property"
    type: str
    title: str
    description: str
    location: str
    approval_status: Optional[str] = "pending"


class ReportResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = ""
    phone_number: str
    category: Optional[str] = "property"
    type: Optional[str] = None
    title: str
    description: str
    location: str
    approval_status: Optional[str] = "pending"
    case_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
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


# Case schemas
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = ""


class CaseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    assigned_to: Optional[int] = None
    notes: Optional[str] = ""
    report_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
