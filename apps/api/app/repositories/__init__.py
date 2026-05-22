from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from app.models import (
    User, Barbershop, Service, Booking, Review, Photo, ServicePhoto,
    UserRole, BarberStatus, BookingStatus
)


# ── USER REPOSITORY ───────────────────────────────────────────────────────────

class UserRepository:

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> Optional[User]:
        return db.query(User).filter(User.phone == phone).first()

    @staticmethod
    def create(db: Session, **kwargs) -> User:
        user = User(**kwargs)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if value is not None:
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user


# ── BARBERSHOP REPOSITORY ─────────────────────────────────────────────────────

class BarbershopRepository:

    @staticmethod
    def get_by_id(db: Session, barbershop_id: int) -> Optional[Barbershop]:
        return db.query(Barbershop).filter(
            Barbershop.id == barbershop_id,
            Barbershop.is_active == True
        ).first()

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        city: Optional[str] = None,
        status: Optional[BarberStatus] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Barbershop], int]:
        query = db.query(Barbershop).filter(Barbershop.is_active == True)

        if city:
            query = query.filter(Barbershop.city.ilike(f"%{city}%"))
        if status:
            query = query.filter(Barbershop.status == status)
        if search:
            query = query.filter(Barbershop.name.ilike(f"%{search}%"))

        # Premium em primeiro lugar, depois por rating
        query = query.order_by(
            Barbershop.is_premium.desc(),
            Barbershop.average_rating.desc()
        )

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_by_owner(db: Session, owner_id: int) -> list[Barbershop]:
        return db.query(Barbershop).filter(
            Barbershop.owner_id == owner_id,
            Barbershop.is_active == True
        ).all()

    @staticmethod
    def get_nearby(
        db: Session,
        lat: float,
        lng: float,
        radius_km: float = 10,
        limit: int = 20,
    ) -> list[Barbershop]:
        """Haversine approximation via PostgreSQL."""
        # 1 grau ≈ 111 km
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * func.cos(func.radians(lat)))

        return db.query(Barbershop).filter(
            Barbershop.is_active == True,
            Barbershop.latitude.isnot(None),
            Barbershop.longitude.isnot(None),
            Barbershop.latitude.between(lat - lat_delta, lat + lat_delta),
            Barbershop.longitude.between(lng - lat_delta, lng + lat_delta),
        ).order_by(Barbershop.is_premium.desc()).limit(limit).all()

    @staticmethod
    def create(db: Session, **kwargs) -> Barbershop:
        shop = Barbershop(**kwargs)
        db.add(shop)
        db.commit()
        db.refresh(shop)
        return shop

    @staticmethod
    def update(db: Session, shop: Barbershop, **kwargs) -> Barbershop:
        for key, value in kwargs.items():
            if value is not None:
                setattr(shop, key, value)
        db.commit()
        db.refresh(shop)
        return shop

    @staticmethod
    def delete(db: Session, shop: Barbershop) -> None:
        shop.is_active = False
        db.commit()

    @staticmethod
    def update_rating(db: Session, barbershop_id: int) -> None:
        result = db.query(
            func.avg(Review.rating).label("avg"),
            func.count(Review.id).label("count"),
        ).filter(Review.barbershop_id == barbershop_id).first()

        shop = db.query(Barbershop).filter(Barbershop.id == barbershop_id).first()
        if shop:
            shop.average_rating = round(float(result.avg or 0), 1)
            shop.total_reviews = result.count or 0
            db.commit()


# ── SERVICE REPOSITORY ────────────────────────────────────────────────────────

class ServiceRepository:

    @staticmethod
    def get_by_id(db: Session, service_id: int) -> Optional[Service]:
        return db.query(Service).filter(Service.id == service_id).first()

    @staticmethod
    def get_by_barbershop(db: Session, barbershop_id: int) -> list[Service]:
        return db.query(Service).filter(
            Service.barbershop_id == barbershop_id,
            Service.is_active == True
        ).all()

    @staticmethod
    def create(db: Session, **kwargs) -> Service:
        service = Service(**kwargs)
        db.add(service)
        db.commit()
        db.refresh(service)
        return service

    @staticmethod
    def update(db: Session, service: Service, **kwargs) -> Service:
        for key, value in kwargs.items():
            if value is not None:
                setattr(service, key, value)
        db.commit()
        db.refresh(service)
        return service

    @staticmethod
    def delete(db: Session, service: Service) -> None:
        service.is_active = False
        db.commit()


# ── BOOKING REPOSITORY ────────────────────────────────────────────────────────

class BookingRepository:

    @staticmethod
    def get_by_id(db: Session, booking_id: int) -> Optional[Booking]:
        return db.query(Booking).filter(Booking.id == booking_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> list[Booking]:
        return db.query(Booking).filter(
            Booking.user_id == user_id
        ).order_by(Booking.created_at.desc()).all()

    @staticmethod
    def get_by_barbershop(db: Session, barbershop_id: int) -> list[Booking]:
        return db.query(Booking).filter(
            Booking.barbershop_id == barbershop_id
        ).order_by(Booking.date.asc(), Booking.time_slot.asc()).all()

    @staticmethod
    def check_conflict(
        db: Session,
        barbershop_id: int,
        date: str,
        time_slot: str,
    ) -> bool:
        """Verifica se já existe marcação no mesmo horário."""
        existing = db.query(Booking).filter(
            and_(
                Booking.barbershop_id == barbershop_id,
                Booking.date == date,
                Booking.time_slot == time_slot,
                Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
            )
        ).first()
        return existing is not None

    @staticmethod
    def get_busy_slots(db: Session, barbershop_id: int, date: str) -> list[str]:
        """Retorna uma lista dos time_slots ocupados (pendentes ou confirmados)."""
        bookings = db.query(Booking).filter(
            and_(
                Booking.barbershop_id == barbershop_id,
                Booking.date == date,
                Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
            )
        ).all()
        return [b.time_slot for b in bookings]

    @staticmethod
    def create(db: Session, **kwargs) -> Booking:
        booking = Booking(**kwargs)
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def update_status(db: Session, booking: Booking, status: BookingStatus) -> Booking:
        booking.status = status
        db.commit()
        db.refresh(booking)
        return booking


# ── REVIEW REPOSITORY ─────────────────────────────────────────────────────────

class ReviewRepository:

    @staticmethod
    def get_by_barbershop(
        db: Session,
        barbershop_id: int,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Review], int]:
        query = db.query(Review).filter(Review.barbershop_id == barbershop_id)
        total = query.count()
        items = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def user_already_reviewed(db: Session, user_id: int, barbershop_id: int) -> bool:
        return db.query(Review).filter(
            Review.user_id == user_id,
            Review.barbershop_id == barbershop_id,
        ).first() is not None

    @staticmethod
    def create(db: Session, **kwargs) -> Review:
        review = Review(**kwargs)
        db.add(review)
        db.commit()
        db.refresh(review)
        return review


# ── PHOTO REPOSITORY ──────────────────────────────────────────────────────────

class PhotoRepository:

    @staticmethod
    def get_by_barbershop(db: Session, barbershop_id: int) -> list[Photo]:
        return db.query(Photo).filter(Photo.barbershop_id == barbershop_id).all()

    @staticmethod
    def create(db: Session, **kwargs) -> Photo:
        photo = Photo(**kwargs)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo

    @staticmethod
    def delete(db: Session, photo: Photo) -> None:
        db.delete(photo)
        db.commit()


# ── SERVICE PHOTO REPOSITORY ──────────────────────────────────────────────────

class ServicePhotoRepository:

    @staticmethod
    def get_by_id(db: Session, photo_id: int) -> Optional[ServicePhoto]:
        return db.query(ServicePhoto).filter(ServicePhoto.id == photo_id).first()

    @staticmethod
    def get_by_service(db: Session, service_id: int) -> list[ServicePhoto]:
        return db.query(ServicePhoto).filter(ServicePhoto.service_id == service_id).order_by(ServicePhoto.display_order.asc()).all()

    @staticmethod
    def create(db: Session, **kwargs) -> ServicePhoto:
        photo = ServicePhoto(**kwargs)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo

    @staticmethod
    def update(db: Session, photo: ServicePhoto, **kwargs) -> ServicePhoto:
        for key, value in kwargs.items():
            if value is not None:
                setattr(photo, key, value)
        db.commit()
        db.refresh(photo)
        return photo

    @staticmethod
    def delete(db: Session, photo: ServicePhoto) -> None:
        db.delete(photo)
        db.commit()
