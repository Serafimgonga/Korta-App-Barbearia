"""
KORTA — Seed de dados de teste simplificado
Limpa a base de dados e cria exactamente 3 utilizadores:
1 Barbeiro (Serafim Gonga) e 2 Clientes (Abel Ferreira, Bruno Tavares).
Cria também 2 barbearias associadas ao barbeiro com serviços, fotos, reviews e marcações de teste.
Uso: cd apps/api && ./venv/bin/python seed_test.py
"""
import sys
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.models import (
    Base, User, Barbershop, Service, ServicePhoto, Booking, Review, Photo,
    UserRole, BarberStatus, BookingStatus, PhotoType, BarberProfile, BarberType
)
from app.core.security import hash_password

UNSPLASH_PHOTOS = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800",
]

def seed_test_db():
    db = SessionLocal()
    
    print("🗑️  Limpando todas as tabelas da base de dados...")
    # Para Postgres, desativamos as restrições de FK temporariamente ou usamos drop_all
    db.close()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    print("✅ Base de dados recriada com sucesso!")

    # 1. Criar Utilizadores
    print("\n👤 Criando utilizadores de teste...")
    
    # Barber (Serafim Gonga)
    barber = User(
        name="Serafim Gonga",
        email="serafim@korta.ao",
        phone="923000001",
        hashed_password=hash_password("korta123"),
        role=UserRole.barber,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        is_active=True,
        is_online=True
    )
    db.add(barber)
    
    # Client 1 (Abel Ferreira)
    client1 = User(
        name="Abel Ferreira",
        email="abel@gmail.com",
        phone="924001001",
        hashed_password=hash_password("korta123"),
        role=UserRole.client,
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        is_active=True
    )
    db.add(client1)
    
    # Client 2 (Bruno Tavares)
    client2 = User(
        name="Bruno Tavares",
        email="bruno@gmail.com",
        phone="924001002",
        hashed_password=hash_password("korta123"),
        role=UserRole.client,
        avatar_url="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200",
        is_active=True
    )
    db.add(client2)
    
    db.commit()
    db.refresh(barber)
    db.refresh(client1)
    db.refresh(client2)
    
    # Criar BarberProfile para Serafim Gonga
    profile = BarberProfile(
        user_id=barber.id,
        barber_type=BarberType.hybrid,
        coverage_radius_km=15.0,
        home_service_fee=1000.0,
        specialties='["Fade", "Barba", "Corte cabelo combo"]',
        years_experience=8,
        bio="Estilo clássico e moderno com finalização profissional.",
        is_available=True,
        onboarding_completed=True
    )
    db.add(profile)
    db.commit()
    print("✅ BarberProfile criado para Serafim Gonga (Hybrid)")
    
    print(f"   Barbeiro: {barber.name} ({barber.email})")
    print(f"   Cliente 1: {client1.name} ({client1.email})")
    print(f"   Cliente 2: {client2.name} ({client2.email})")

    # 2. Criar Barbearias
    print("\n🏪 Criando barbearias de teste...")
    
    shop1 = Barbershop(
        owner_id=barber.id,
        name="KORTA Premium Club",
        description="A barbearia número 1 de Ícolo e Bengo. Estilo, tradição e excelência no Kissama.",
        address="Rua da Independência, km 30, Kissama",
        city="Ícolo e Bengo",
        province="Luanda",
        latitude=-9.1333,
        longitude=13.4833,
        phone="923100001",
        whatsapp="923100001",
        open_hours="Seg-Sáb: 08:00 - 20:00",
        is_premium=True,
        status=BarberStatus.open,
        average_rating=5.0,
        total_reviews=2
    )
    db.add(shop1)
    
    shop2 = Barbershop(
        owner_id=barber.id,
        name="Luanda Style Barber",
        description="Cortes modernos e clássicos com a alma urbana de Luanda. Experiência e estilo garantidos.",
        address="Avenida Valódia, Ingombota",
        city="Luanda",
        province="Luanda",
        latitude=-8.8271,
        longitude=13.2330,
        phone="923100002",
        whatsapp="923100002",
        open_hours="Seg-Sáb: 09:00 - 21:00",
        is_premium=False,
        status=BarberStatus.open,
        average_rating=4.5,
        total_reviews=1
    )
    db.add(shop2)
    
    db.commit()
    db.refresh(shop1)
    db.refresh(shop2)
    
    print(f"   Barbearia 1: {shop1.name} ({shop1.city})")
    print(f"   Barbearia 2: {shop2.name} ({shop2.city})")

    # 3. Criar Serviços para cada barbearia
    print("\n✂️  Criando serviços...")
    
    services_data = [
        {"name": "Corte Simples", "description": "Corte clássico tesoura/máquina", "price": 1500, "duration_minutes": 30},
        {"name": "Fade + Linha", "description": "Corte degradê moderno com finalização de navalha", "price": 2500, "duration_minutes": 45},
        {"name": "Barba Completa", "description": "Design de barba com toalha quente e óleo", "price": 2000, "duration_minutes": 30},
        {"name": "Corte + Barba", "description": "Combo de corte simples e barba completa", "price": 4000, "duration_minutes": 60},
    ]
    
    services_shop1 = []
    services_shop2 = []
    
    for s_data in services_data:
        # Shop 1 Services
        svc1 = Service(barbershop_id=shop1.id, is_active=True, **s_data)
        db.add(svc1)
        services_shop1.append(svc1)
        
        # Shop 2 Services
        svc2 = Service(barbershop_id=shop2.id, is_active=True, **s_data)
        db.add(svc2)
        services_shop2.append(svc2)
        
    db.commit()
    
    # Atualizar IDs de serviços
    for s in services_shop1: db.refresh(s)
    for s in services_shop2: db.refresh(s)
    
    print(f"   Criados {len(services_shop1)} serviços em cada barbearia.")

    # 4. Criar Fotos das barbearias
    print("\n📸 Adicionando fotos de portfólio...")
    for idx, shop in enumerate([shop1, shop2]):
        for i, url in enumerate(UNSPLASH_PHOTOS):
            db.add(Photo(
                barbershop_id=shop.id,
                url=url,
                photo_type=PhotoType.haircut,
                caption=f"Trabalho #{i+1} — {shop.name}"
            ))
    db.commit()
    print("   Fotos adicionadas.")

    # 5. Criar Reviews
    print("\n⭐ Criando avaliações/reviews...")
    
    # Reviews para Shop 1
    db.add(Review(user_id=client1.id, barbershop_id=shop1.id, rating=5, comment="Excelente atendimento e corte impecável!"))
    db.add(Review(user_id=client2.id, barbershop_id=shop1.id, rating=5, comment="O melhor degradê de Ícolo e Bengo."))
    
    # Review para Shop 2
    db.add(Review(user_id=client1.id, barbershop_id=shop2.id, rating=4, comment="Muito bom, recomendo!"))
    
    db.commit()
    print("   Reviews criadas.")

    # 6. Criar Marcações (Hoje, Futuras, Passadas)
    print("\n📅 Criando marcações (agendamentos)...")
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # --- Agendamentos de Hoje para a Barbearia 1 (KORTA Premium Club) ---
    # 1. Abel Ferreira - Fade + Linha - 10:00 - Confirmado (hoje)
    db.add(Booking(
        user_id=client1.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[1].id, # Fade + Linha (2500)
        date=today_str,
        time_slot="10:00",
        status=BookingStatus.confirmed,
        total_price=2500
    ))
    
    # 2. Bruno Tavares - Corte + Barba - 11:30 - Concluído (hoje)
    db.add(Booking(
        user_id=client2.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[3].id, # Corte + Barba (4000)
        date=today_str,
        time_slot="11:30",
        status=BookingStatus.completed,
        total_price=4000
    ))
    
    # 3. Abel Ferreira - Corte Simples - 14:00 - Pendente (hoje)
    db.add(Booking(
        user_id=client1.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[0].id, # Corte Simples (1500)
        date=today_str,
        time_slot="14:00",
        status=BookingStatus.pending,
        total_price=1500
    ))
    
    # 4. Bruno Tavares - Barba Completa - 16:00 - Confirmado (hoje)
    db.add(Booking(
        user_id=client2.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[2].id, # Barba Completa (2000)
        date=today_str,
        time_slot="16:00",
        status=BookingStatus.confirmed,
        total_price=2000
    ))
    
    # Total de hoje na Barbearia 1: 4 marcações (2 confirmadas, 1 concluída, 1 pendente)
    # Total Receita Confirmada/Concluída hoje na Barbearia 1: 2500 + 4000 + 2000 = 8500 Kz
    
    # --- Agendamentos de Hoje para a Barbearia 2 (Luanda Style Barber) ---
    # 1. Abel Ferreira - Corte Simples - 09:00 - Confirmado (hoje)
    db.add(Booking(
        user_id=client1.id,
        barbershop_id=shop2.id,
        service_id=services_shop2[0].id, # Corte Simples (1500)
        date=today_str,
        time_slot="09:00",
        status=BookingStatus.confirmed,
        total_price=1500
    ))
    
    # 2. Bruno Tavares - Barba Completa - 15:00 - Concluído (hoje)
    db.add(Booking(
        user_id=client2.id,
        barbershop_id=shop2.id,
        service_id=services_shop2[2].id, # Barba Completa (2000)
        date=today_str,
        time_slot="15:00",
        status=BookingStatus.completed,
        total_price=2000
    ))
    
    # --- Agendamentos futuros / passados ---
    # Futuro (Amanhã) na Barbearia 1 - Pendente
    db.add(Booking(
        user_id=client1.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[1].id,
        date=tomorrow_str,
        time_slot="10:00",
        status=BookingStatus.pending,
        total_price=2500
    ))
    
    # Passado (Ontem) na Barbearia 1 - Concluído
    db.add(Booking(
        user_id=client2.id,
        barbershop_id=shop1.id,
        service_id=services_shop1[3].id,
        date=yesterday_str,
        time_slot="17:00",
        status=BookingStatus.completed,
        total_price=4000
    ))
    
    db.commit()
    print("   Marcações criadas com sucesso.")
    
    db.close()
    print("\n" + "="*60)
    print("🎉 SEED DE TESTE SIMPLIFICADO CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print("📊 Usuários disponíveis para Login/Teste:")
    print("  🔑 [BARBEIRO]")
    print("      Email: serafim@korta.ao | Senha: korta123")
    print("  🔑 [CLIENTE 1]")
    print("      Email: abel@gmail.com   | Senha: korta123")
    print("  🔑 [CLIENTE 2]")
    print("      Email: bruno@gmail.com  | Senha: korta123")
    print("="*60 + "\n")

if __name__ == "__main__":
    seed_test_db()
