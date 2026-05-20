from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import ReviewCreate, Review, ReviewPaginationResponse
from app.services import ReviewService
from app.utils.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=Review, status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cria uma nova avaliação para uma barbearia."""
    return ReviewService.create(db, data, current_user.id)


@router.get("/barbershop/{barbershop_id}", response_model=ReviewPaginationResponse)
def list_reviews(
    barbershop_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lista avaliações de uma barbearia com paginação."""
    return ReviewService.list_by_barbershop(db, barbershop_id, page, per_page)
