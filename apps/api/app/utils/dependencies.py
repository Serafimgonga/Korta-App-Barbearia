from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.repositories import UserRepository
from app.models import User, UserRole, Barbershop

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT and return the authenticated user."""
    payload = decode_token(credentials.credentials)
    user = UserRepository.get_by_id(db, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizador não encontrado ou inativo",
        )
    return user


def require_barber(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is a barber or admin."""
    if current_user.role not in [UserRole.barber, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas barbeiros têm acesso a esta funcionalidade",
        )
    return current_user


def get_active_shop(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Barbershop:
    """Extract active_shop_id from JWT and return the corresponding barbershop if owned by the current user."""
    payload = decode_token(credentials.credentials)
    active_shop_id = payload.get("active_shop_id")
    if not active_shop_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma barbearia activa. Faz switch primeiro.",
        )
    try:
        shop_id = int(active_shop_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de barbearia inválido no token.",
        )

    shop = db.query(Barbershop).filter(
        Barbershop.id == shop_id,
        Barbershop.owner_id == current_user.id
    ).first()

    if not shop:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Barbearia não encontrada ou sem acesso.",
        )
    return shop


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is an admin."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores têm acesso",
        )
    return current_user
