from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.repositories import (
    UserRepository, BarbershopRepository, ServiceRepository,
    BookingRepository, ReviewRepository, PhotoRepository
)
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserUpdate,
    BarbershopCreate, BarbershopUpdate,
    ServiceCreate, ServiceUpdate,
    BookingCreate, BookingStatusUpdate,
    ReviewCreate,
)
from app.models import UserRole, BookingStatus


# ── AUTH SERVICE ──────────────────────────────────────────────────────────────

class AuthService:

    @staticmethod
    def register(db: Session, data: UserRegister):
        if UserRepository.get_by_email(db, data.email):
            raise HTTPException(status_code=400, detail="Email já está em uso")
        if data.phone and UserRepository.get_by_phone(db, data.phone):
            raise HTTPException(status_code=400, detail="Telefone já está em uso")

        user = UserRepository.create(
            db,
            name=data.name,
            email=data.email,
            phone=data.phone,
            hashed_password=hash_password(data.password),
            role=data.role,
        )
        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )

    @staticmethod
    def login(db: Session, data: UserLogin):
        user = UserRepository.get_by_email(db, data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Conta desativada")

        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )

    @staticmethod
    def refresh(db: Session, refresh_token: str):
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = UserRepository.get_by_id(db, int(payload["sub"]))
        if not user:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado")
        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )


# ── USER SERVICE ──────────────────────────────────────────────────────────────

class UserService:

    @staticmethod
    def get_me(db: Session, user_id: int):
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado")
        return user

    @staticmethod
    def update_me(db: Session, user_id: int, data: UserUpdate):
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado")
        return UserRepository.update(db, user, **data.model_dump(exclude_none=True))


# ── BARBERSHOP SERVICE ────────────────────────────────────────────────────────

class BarbershopService:

    @staticmethod
    def list_all(
        db: Session,
        page: int = 1,
        per_page: int = 20,
        city: Optional[str] = None,
        status=None,
        search: Optional[str] = None,
    ):
        skip = (page - 1) * per_page
        items, total = BarbershopRepository.get_all(db, skip, per_page, city, status, search)
        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": -(-total // per_page),  # ceil division
        }

    @staticmethod
    def get_nearby(db: Session, lat: float, lng: float, radius_km: float = 10):
        return BarbershopRepository.get_nearby(db, lat, lng, radius_km)

    @staticmethod
    def get_detail(db: Session, barbershop_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        return shop

    @staticmethod
    def create(db: Session, data: BarbershopCreate, owner_id: int):
        return BarbershopRepository.create(db, owner_id=owner_id, **data.model_dump())

    @staticmethod
    def update(db: Session, barbershop_id: int, data: BarbershopUpdate, current_user_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        return BarbershopRepository.update(db, shop, **data.model_dump(exclude_none=True))

    @staticmethod
    def delete(db: Session, barbershop_id: int, current_user_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        BarbershopRepository.delete(db, shop)

    @staticmethod
    def my_barbershops(db: Session, owner_id: int):
        return BarbershopRepository.get_by_owner(db, owner_id)


# ── SERVICE SERVICE (serviços da barbearia) ───────────────────────────────────

class ServiceService:

    @staticmethod
    def list_by_barbershop(db: Session, barbershop_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        return ServiceRepository.get_by_barbershop(db, barbershop_id)

    @staticmethod
    def create(db: Session, barbershop_id: int, data: ServiceCreate, current_user_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        return ServiceRepository.create(db, barbershop_id=barbershop_id, **data.model_dump())

    @staticmethod
    def update(db: Session, service_id: int, data: ServiceUpdate, current_user_id: int):
        service = ServiceRepository.get_by_id(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")
        shop = BarbershopRepository.get_by_id(db, service.barbershop_id)
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        return ServiceRepository.update(db, service, **data.model_dump(exclude_none=True))

    @staticmethod
    def delete(db: Session, service_id: int, current_user_id: int):
        service = ServiceRepository.get_by_id(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")
        shop = BarbershopRepository.get_by_id(db, service.barbershop_id)
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        ServiceRepository.delete(db, service)


# ── BOOKING SERVICE ───────────────────────────────────────────────────────────

class BookingService:

    @staticmethod
    def create(db: Session, data: BookingCreate, user_id: int):
        shop = BarbershopRepository.get_by_id(db, data.barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")

        service = ServiceRepository.get_by_id(db, data.service_id)
        if not service or service.barbershop_id != data.barbershop_id:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")

        if BookingRepository.check_conflict(db, data.barbershop_id, data.date, data.time_slot):
            raise HTTPException(status_code=409, detail="Horário já está ocupado")

        return BookingRepository.create(
            db,
            user_id=user_id,
            barbershop_id=data.barbershop_id,
            service_id=data.service_id,
            date=data.date,
            time_slot=data.time_slot,
            notes=data.notes,
            total_price=service.price,
        )

    @staticmethod
    def my_bookings(db: Session, user_id: int):
        return BookingRepository.get_by_user(db, user_id)

    @staticmethod
    def barbershop_bookings(db: Session, barbershop_id: int, current_user_id: int):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        if shop.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
        return BookingRepository.get_by_barbershop(db, barbershop_id)

    @staticmethod
    def update_status(db: Session, booking_id: int, data: BookingStatusUpdate, current_user_id: int):
        booking = BookingRepository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Marcação não encontrada")

        shop = BarbershopRepository.get_by_id(db, booking.barbershop_id)
        is_owner = shop and shop.owner_id == current_user_id
        is_client = booking.user_id == current_user_id

        if not is_owner and not is_client:
            raise HTTPException(status_code=403, detail="Sem permissão")

        # Clientes só podem cancelar
        if is_client and not is_owner and data.status != BookingStatus.cancelled:
            raise HTTPException(status_code=403, detail="Clientes só podem cancelar marcações")

        return BookingRepository.update_status(db, booking, data.status)


# ── REVIEW SERVICE ────────────────────────────────────────────────────────────

class ReviewService:

    @staticmethod
    def create(db: Session, data: ReviewCreate, user_id: int):
        shop = BarbershopRepository.get_by_id(db, data.barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")

        if ReviewRepository.user_already_reviewed(db, user_id, data.barbershop_id):
            raise HTTPException(status_code=409, detail="Já avaliaste esta barbearia")

        review = ReviewRepository.create(
            db,
            user_id=user_id,
            barbershop_id=data.barbershop_id,
            rating=data.rating,
            comment=data.comment,
        )
        BarbershopRepository.update_rating(db, data.barbershop_id)
        return review

    @staticmethod
    def list_by_barbershop(db: Session, barbershop_id: int, page: int = 1, per_page: int = 20):
        shop = BarbershopRepository.get_by_id(db, barbershop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Barbearia não encontrada")
        skip = (page - 1) * per_page
        items, total = ReviewRepository.get_by_barbershop(db, barbershop_id, skip, per_page)
        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": -(-total // per_page),
        }
