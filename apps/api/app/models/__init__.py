from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    ForeignKey, DateTime, Enum, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


# ── Enums ─────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    client = "client"
    barber = "barber"
    admin = "admin"


class BarberStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    paused = "paused"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    no_show = "no_show"


class PhotoType(str, enum.Enum):
    exterior = "exterior"
    interior = "interior"
    haircut = "haircut"
    team = "team"


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.client, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    barbershops = relationship("Barbershop", back_populates="owner")
    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id")
    reviews = relationship("Review", back_populates="user")


class Barbershop(Base):
    __tablename__ = "barbershops"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String(300), nullable=False)
    city = Column(String(100), default="Ícolo e Bengo")
    province = Column(String(100), default="Luanda")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    status = Column(Enum(BarberStatus), default=BarberStatus.open)
    open_hours = Column(String(200), nullable=True)  # ex: "Seg-Sex: 08h-20h"
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    owner = relationship("User", back_populates="barbershops")
    services = relationship("Service", back_populates="barbershop", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="barbershop")
    reviews = relationship("Review", back_populates="barbershop")
    photos = relationship("Photo", back_populates="barbershop", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    barbershop = relationship("Barbershop", back_populates="services")
    bookings = relationship("Booking", back_populates="service")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    date = Column(String(10), nullable=False)        # ex: "2024-12-15"
    time_slot = Column(String(5), nullable=False)    # ex: "10:30"
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    notes = Column(Text, nullable=True)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    barbershop = relationship("Barbershop", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", back_populates="reviews")
    barbershop = relationship("Barbershop", back_populates="reviews")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    url = Column(String(500), nullable=False)
    public_id = Column(String(200), nullable=True)  # Cloudinary public_id
    photo_type = Column(Enum(PhotoType), default=PhotoType.haircut)
    caption = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    barbershop = relationship("Barbershop", back_populates="photos")
