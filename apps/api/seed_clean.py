from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import (
    Base, User, Barbershop, Service, ServicePhoto, Booking, Review, Photo,
    UserRole, BarberStatus, BookingStatus, PhotoType, BookingRequest, BookingRequestStatus,
    BarberProfile, BarberType
)
from app.core.security import hash_password

def seed_clean():
    db = SessionLocal()
    
    print("🗑️  A limpar todas as tabelas da base de dados...")
    # Clean in correct dependency order
    db.query(BookingRequest).delete()
    db.query(Booking).delete()
    db.query(Review).delete()
    db.query(ServicePhoto).delete()
    db.query(Photo).delete()
    db.query(Service).delete()
    db.query(Barbershop).delete()
    db.query(BarberProfile).delete()
    db.query(User).delete()
    db.commit()
    print("✅ Base de dados limpa com sucesso.")

    # 1. Criar o utilizador Barbeiro (kuyuyu@korta.ao)
    print("\n👤 A criar Barbeiro (kuyuyu@korta.ao)...")
    barber = User(
        name="Kuyuyu Barber",
        email="kuyuyu@korta.ao",
        phone="923000001",
        hashed_password=hash_password("123456"),
        role=UserRole.barber,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        is_active=True,
        is_online=True,  # Deve estar online para receber pedidos on-demand
    )
    db.add(barber)
    db.commit()
    db.refresh(barber)
    print(f"✅ Barbeiro criado: {barber.name} ({barber.email})")

    # Criar Perfil de Barbeiro para Kuyuyu
    profile = BarberProfile(
        user_id=barber.id,
        barber_type=BarberType.hybrid,
        coverage_radius_km=15.0,
        home_service_fee=500.0,
        specialties='["Fade", "Barba", "Corte cabelo"]',
        years_experience=5,
        bio="Especialista em degradê e design de barba premium.",
        is_available=True,
        onboarding_completed=True
    )
    db.add(profile)
    db.commit()
    print("✅ BarberProfile criado para Kuyuyu (Hybrid)")

    # 2. Criar o utilizador Cliente (cliente@gmail.com)
    print("\n👥 A criar Cliente (cliente@gmail.com)...")
    client = User(
        name="Cliente Korta",
        email="cliente@gmail.com",
        phone="924001001",
        hashed_password=hash_password("123456"),
        role=UserRole.client,
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        is_active=True,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    print(f"✅ Cliente criado: {client.name} ({client.email})")

    # 3. Criar a Barbearia associada ao barbeiro Kuyuyu
    print("\n🏪 A criar Barbearia...")
    shop = Barbershop(
        owner_id=barber.id,
        name="KORTA Premium Club",
        description="A barbearia premium oficial do KORTA. Estilo e excelência ao teu alcance.",
        address="Rua da Independência, km 30, Luanda",
        city="Luanda",
        province="Luanda",
        latitude=-8.8383,
        longitude=13.2344,
        phone="923100001",
        whatsapp="923100001",
        status=BarberStatus.open,
        open_hours="Seg-Dom: 08:00 - 21:00",
        is_premium=True,
        average_rating=4.9,
        total_reviews=1,
        is_active=True,
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)
    print(f"✅ Barbearia criada: {shop.name}")

    # 4. Criar Serviços da Barbearia (exatamente os 3 serviços do ecrã de select-service)
    print("\n✂️  A criar Serviços...")
    services = [
        {"name": "Corte cabelo", "description": "Corte de cabelo moderno com tesoura e máquina", "price": 500, "duration_minutes": 15},
        {"name": "Barba", "description": "Aparar, alinhar e hidratar a barba", "price": 300, "duration_minutes": 10},
        {"name": "Kit completo", "description": "Corte cabelo + Barba + Lavagem e acabamento completo", "price": 800, "duration_minutes": 30},
    ]

    for svc_data in services:
        svc = Service(
            barbershop_id=shop.id,
            is_active=True,
            **svc_data
        )
        db.add(svc)
    db.commit()
    print("✅ Serviços criados com sucesso.")

    db.close()
    print("\n🎉 Seed limpo concluído com sucesso!")
    print("=====================================================")
    print("  🔑 Credenciais de Login:")
    print("     • Cliente:   cliente@gmail.com  /  123456")
    print("     • Barbeiro:  kuyuyu@korta.ao    /  123456")
    print("=====================================================\n")

if __name__ == "__main__":
    seed_clean()
