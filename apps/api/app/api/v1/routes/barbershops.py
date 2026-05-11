from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.schemas import (
    BarbershopCreate, BarbershopUpdate,
    BarbershopResponse, BarbershopListResponse, BarbershopListContainer,
    ServiceCreate, ServiceUpdate, ServiceResponse,
)
from app.services import BarbershopService, ServiceService
from app.utils.dependencies import get_current_user, require_barber
from app.models import User, BarberStatus

router = APIRouter(prefix="/barbershops", tags=["Barbershops"])


# ── Listagem e pesquisa ───────────────────────────────────────────────────────

@router.get("", response_model=BarbershopListContainer)
def list_barbershops(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    city: Optional[str] = Query(None),
    status: Optional[BarberStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Lista barbearias com filtros e paginação."""
    return BarbershopService.list_all(db, page, per_page, city, status, search)


@router.get("/nearby", response_model=list[BarbershopListResponse])
def get_nearby(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Barbearias próximas por coordenadas GPS."""
    return BarbershopService.get_nearby(db, lat, lng, radius_km)


@router.get("/mine", response_model=list[BarbershopListResponse])
def my_barbershops(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Barbearias do barbeiro autenticado."""
    return BarbershopService.my_barbershops(db, current_user.id)


@router.get("/{barbershop_id}", response_model=BarbershopResponse)
def get_barbershop(barbershop_id: int, db: Session = Depends(get_db)):
    """Detalhes completos de uma barbearia (inclui serviços e fotos)."""
    return BarbershopService.get_detail(db, barbershop_id)


# ── CRUD ──────────────────────────────────────────────────────────────────────

@router.post("", response_model=BarbershopResponse, status_code=201)
def create_barbershop(
    data: BarbershopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Cria nova barbearia. Apenas barbeiros."""
    return BarbershopService.create(db, data, current_user.id)


@router.put("/{barbershop_id}", response_model=BarbershopResponse)
def update_barbershop(
    barbershop_id: int,
    data: BarbershopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Atualiza barbearia. Apenas o dono."""
    return BarbershopService.update(db, barbershop_id, data, current_user.id)


@router.delete("/{barbershop_id}", status_code=204)
def delete_barbershop(
    barbershop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Remove barbearia (soft delete). Apenas o dono."""
    BarbershopService.delete(db, barbershop_id, current_user.id)


# ── Serviços da barbearia ─────────────────────────────────────────────────────

@router.get("/{barbershop_id}/services", response_model=list[ServiceResponse])
def list_services(barbershop_id: int, db: Session = Depends(get_db)):
    """Lista serviços de uma barbearia."""
    return ServiceService.list_by_barbershop(db, barbershop_id)


@router.post("/{barbershop_id}/services", response_model=ServiceResponse, status_code=201)
def create_service(
    barbershop_id: int,
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Adiciona serviço à barbearia."""
    return ServiceService.create(db, barbershop_id, data, current_user.id)


@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Atualiza serviço."""
    return ServiceService.update(db, service_id, data, current_user.id)


@router.delete("/services/{service_id}", status_code=204)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
):
    """Remove serviço."""
    ServiceService.delete(db, service_id, current_user.id)
