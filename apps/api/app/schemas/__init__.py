from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models import UserRole, BarberStatus, BookingStatus, PhotoType


# ── SHARED SCHEMAS ────────────────────────────────────────────────────────────

class Message(BaseModel):
    message: str


# ── AUTH / TOKEN SCHEMAS ──────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ShopSwitchRequest(BaseModel):
    shop_id: int


# ── USER SCHEMAS ──────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = UserRole.client
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = True


class UserRegister(UserBase):
    name: str
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ── PHOTO SCHEMAS ─────────────────────────────────────────────────────────────

class PhotoBase(BaseModel):
    url: str
    public_id: Optional[str] = None
    photo_type: Optional[PhotoType] = PhotoType.haircut
    caption: Optional[str] = None


class PhotoCreate(PhotoBase):
    barbershop_id: int


class Photo(PhotoBase):
    id: int
    barbershop_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── SERVICE PHOTO SCHEMAS ──────────────────────────────────────────────────────

class ServicePhotoBase(BaseModel):
    url: str
    caption: Optional[str] = None
    display_order: Optional[int] = 0


class ServicePhotoCreate(ServicePhotoBase):
    service_id: int
    shop_id: int


class ServicePhotoUpdate(BaseModel):
    caption: Optional[str] = None
    display_order: Optional[int] = None


class ServicePhoto(ServicePhotoBase):
    id: int
    service_id: int
    shop_id: int
    uploaded_by: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── SERVICE SCHEMAS ───────────────────────────────────────────────────────────

class ServiceBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = 30
    is_active: Optional[bool] = True


class ServiceCreate(ServiceBase):
    name: str
    price: float
    barbershop_id: Optional[int] = None


class ServiceUpdate(ServiceBase):
    pass


class ServiceResponse(ServiceBase):
    id: int
    barbershop_id: int
    created_at: datetime
    photos: List[ServicePhoto] = []

    model_config = ConfigDict(from_attributes=True)


# ── BARBERSHOP SCHEMAS ────────────────────────────────────────────────────────

class BarbershopBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Ícolo e Bengo"
    province: Optional[str] = "Luanda"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    status: Optional[BarberStatus] = BarberStatus.open
    open_hours: Optional[str] = None
    is_premium: Optional[bool] = False
    is_active: Optional[bool] = True


class BarbershopCreate(BarbershopBase):
    name: str
    address: str


class BarbershopUpdate(BarbershopBase):
    pass


class BarbershopListResponse(BarbershopBase):
    id: int
    owner_id: int
    average_rating: float
    total_reviews: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BarbershopResponse(BarbershopListResponse):
    updated_at: Optional[datetime] = None
    services: List[ServiceResponse] = []
    photos: List[Photo] = []

    model_config = ConfigDict(from_attributes=True)


class BarbershopListContainer(BaseModel):
    items: List[BarbershopListResponse]
    total: int
    page: int
    per_page: int
    pages: int

    model_config = ConfigDict(from_attributes=True)


# ── BOOKING SCHEMAS ───────────────────────────────────────────────────────────

class BookingBase(BaseModel):
    date: Optional[str] = None
    time_slot: Optional[str] = None
    status: Optional[BookingStatus] = BookingStatus.pending
    notes: Optional[str] = None
    total_price: Optional[float] = None


class BookingCreate(BookingBase):
    barbershop_id: int
    service_id: int
    date: str
    time_slot: str


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BookingBase):
    id: int
    user_id: int
    barbershop_id: int
    service_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    user: Optional[User] = None
    barbershop: Optional[BarbershopResponse] = None
    service: Optional[ServiceResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ── REVIEW SCHEMAS ────────────────────────────────────────────────────────────

class ReviewBase(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    barbershop_id: int
    rating: int = Field(..., ge=1, le=5)


class ReviewUpdate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int
    user_id: int
    barbershop_id: int
    created_at: datetime
    
    user: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewPaginationResponse(BaseModel):
    items: List[Review]
    total: int
    page: int
    per_page: int
    pages: int

    model_config = ConfigDict(from_attributes=True)
