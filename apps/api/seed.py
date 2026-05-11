from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, Barbershop, Service, UserRole, BarberStatus
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    # 1. Criar utilizador barbeiro
    if not db.query(User).filter(User.email == "barbeiro@korta.ao").first():
        barber = User(
            name="Serafim Gonga",
            email="barbeiro@korta.ao",
            hashed_password=hash_password("123456"),
            role=UserRole.barber,
            phone="923000000"
        )
        db.add(barber)
        db.commit()
        db.refresh(barber)

        # 2. Criar barbearia
        shop = Barbershop(
            owner_id=barber.id,
            name="KORTA Premium Club",
            description="A barbearia número 1 de Ícolo e Bengo. Estilo, tradição e excelência.",
            address="Rua da Independência, km 30",
            city="Ícolo e Bengo",
            latitude=-9.1333,
            longitude=13.4833,
            is_premium=True,
            status=BarberStatus.open,
            open_hours="Seg-Sáb: 08:00 - 20:00"
        )
        db.add(shop)
        db.commit()
        db.refresh(shop)

        # 3. Criar serviços
        services = [
            Service(barbershop_id=shop.id, name="Corte Clássico", description="Corte simples com tesoura e máquina", price=2500, duration_minutes=45),
            Service(barbershop_id=shop.id, name="Barba & Toalha Quente", description="Tratamento completo de barba", price=1500, duration_minutes=30),
            Service(barbershop_id=shop.id, name="KORTA Completo", description="Corte + Barba + Lavagem", price=3500, duration_minutes=75),
        ]
        db.add_all(services)
        db.commit()

        print("✅ Dados de teste (Seed) inseridos com sucesso!")
    else:
        print("ℹ️ Dados de teste já existem.")
    
    db.close()

if __name__ == "__main__":
    seed()
