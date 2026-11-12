from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    level: str = "beginner"
    phone: Optional[str] = None
    state: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    level: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None

class ResourceIn(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)
