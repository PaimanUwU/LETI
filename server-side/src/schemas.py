from pydantic import BaseModel, EmailStr
from datetime import datetime

# Request schema - what client sends
class UserCreate(BaseModel):
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
