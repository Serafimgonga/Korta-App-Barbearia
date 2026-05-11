from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import User, UserUpdate
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
