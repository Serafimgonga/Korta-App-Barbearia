from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import BookingCreate, BookingStatusUpdate, BookingResponse
from app.services import BookingService
from app.utils.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cria nova marcação. Verifica conflitos de horário automaticamente."""
    return BookingService.create(db, data, current_user.id)


@router.get("/me", response_model=list[BookingResponse])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marcações do utilizador autenticado."""
    return BookingService.my_bookings(db, current_user.id)


@router.get("/barbershop/{barbershop_id}", response_model=list[BookingResponse])
def barbershop_bookings(
    barbershop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marcações de uma barbearia. Apenas o dono."""
    return BookingService.barbershop_bookings(db, barbershop_id, current_user.id)


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aceitar, confirmar ou cancelar marcação."""
    return BookingService.update_status(db, booking_id, data, current_user.id)
