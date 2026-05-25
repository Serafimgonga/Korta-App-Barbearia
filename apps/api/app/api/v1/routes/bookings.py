from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import (
    BookingCreate, BookingStatusUpdate, BookingResponse,
    BookingRequestCreate, BookingRequestResponse,
)
from app.services import BookingService, BookingRequestService
from app.utils.dependencies import get_current_user, get_active_shop, require_barber
from app.models import User, Barbershop
from app.repositories import BookingRequestRepository

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("", response_model=list[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
    active_shop: Barbershop = Depends(get_active_shop),
):
    """Marcações da barbearia activa."""
    return BookingService.barbershop_bookings(db, active_shop.id, active_shop.owner_id)


@router.get("/busy-slots", response_model=list[str])
def get_busy_slots(
    barbershop_id: int,
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retorna os horários que já estão ocupados para uma determinada data."""
    return BookingService.get_busy_slots(db, barbershop_id, date)



@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cria nova marcação. Verifica conflitos de horário automaticamente."""
    return BookingService.create(db, data, current_user.id)



@router.post("/request", response_model=BookingRequestResponse, status_code=201)
def create_booking_request(
    data: BookingRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Criar um pedido de booking para matchmaking/dispatch."""
    req = BookingRequestService.create_request(db, data, current_user.id)
    # Enfileirar dispatch em background (vai tentar contactar barbeiros)
    try:
        background_tasks.add_task(BookingRequestService.dispatch_request, req.id)
    except Exception:
        # se BackgroundTasks não estiver disponível (ex: chamadas internas), apenas ignora
        pass
    return req


@router.get('/request/{request_id}', response_model=BookingRequestResponse)
def get_booking_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cliente consulta o estado do seu booking_request."""
    req = BookingRequestRepository.get_by_id(db, request_id)
    if not req:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Pedido não encontrado')
    if req.client_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='Sem permissão para ver este pedido')
    return req


@router.get("/requests/pending", response_model=list[BookingRequestResponse])
def list_pending_requests(
    lat: float,
    lng: float,
    radius_km: int = 10,
    service_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Listar pedidos pendentes dentro do raio (para barbeiros)."""
    return BookingRequestService.list_pending(db, lat, lng, radius_km, service_id)


@router.post("/requests/{request_id}/accept", response_model=BookingResponse, status_code=201)
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
    active_shop: Barbershop = Depends(get_active_shop),
):
    """Barbeiro aceita um pedido e cria o booking correspondente (imediato)."""
    return BookingRequestService.accept_request(db, request_id, current_user.id, active_shop.id)


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
