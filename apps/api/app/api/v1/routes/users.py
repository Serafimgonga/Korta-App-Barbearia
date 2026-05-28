from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import User, UserUpdate, OnlineStatus, BarberProfileResponse, BarberProfileUpdate
from app.services import UserService
from app.utils.dependencies import get_current_user
from app.models import User as UserModel

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=User)
def get_me(current_user: UserModel = Depends(get_current_user)):
    """Obtém o perfil do utilizador autenticado."""
    return current_user


@router.put("/me", response_model=User)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Atualiza o perfil do utilizador autenticado."""
    return UserService.update_me(db, current_user.id, data)


@router.post('/me/online', response_model=User)
def set_online(
    data: OnlineStatus,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Toggle online/offline do utilizador (barbeiro)."""
    return UserService.set_online(db, current_user.id, data.is_online)


@router.get("/me/barber-profile", response_model=BarberProfileResponse)
def get_barber_profile(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Obtém o perfil do barbeiro autenticado."""
    return UserService.get_barber_profile(db, current_user.id)


@router.put("/me/barber-profile", response_model=BarberProfileResponse)
def update_barber_profile(
    data: BarberProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Atualiza o perfil do barbeiro autenticado."""
    return UserService.update_barber_profile(db, current_user.id, data)
