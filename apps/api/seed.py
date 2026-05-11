from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, Barbershop, Service, UserRole, BarberStatus
from app.core.security import hash_password

# Dados das barbearias de teste
BARBERSHOPS = [
    {
        "name": "KORTA Premium Club",
        "description": "A barbearia número 1 de Ícolo e Bengo. Estilo, tradição e excelência desde 2020.",
        "address": "Rua da Independência, km 30",
        "city": "Ícolo e Bengo",
        "latitude": -9.1333,
        "longitude": 13.4833,
        "phone": "923000001",
        "whatsapp": "923000001",
        "open_hours": "Seg-Sáb: 08:00 - 20:00",
        "is_premium": True,
        "status": BarberStatus.open,
    },
    {
        "name": "Barbearia do Zé",
        "description": "Cortes clássicos e modernos ao melhor preço. Ambiente familiar e descontraído.",
        "address": "Avenida 4 de Fevereiro, Viana",
        "city": "Viana",
        "latitude": -8.9053,
        "longitude": 13.3749,
        "phone": "923000002",
        "whatsapp": "923000002",
        "open_hours": "Seg-Sex: 09:00 - 19:00 | Sáb: 08:00 - 17:00",
        "is_premium": False,
        "status": BarberStatus.open,
    },
    {
        "name": "UrbanCuts Studio",
        "description": "Barbearia moderna especializada em estilos urbanos e barbas. Experiência premium no Cacuaco.",
        "address": "Rua Mártires de Kifangondo, Cacuaco",
        "city": "Cacuaco",
        "latitude": -8.7800,
        "longitude": 13.3660,
        "phone": "923000003",
        "whatsapp": "923000003",
        "open_hours": "Ter-Dom: 10:00 - 21:00",
        "is_premium": True,
        "status": BarberStatus.open,
    },
    {
        "name": "Barber King",
        "description": "O rei dos cortes. Especialistas em fade, linha e barba. Venha ser rei!",
        "address": "Largo do Ambiente, Km 28, Luanda",
        "city": "Luanda",
        "latitude": -8.8383,
        "longitude": 13.2344,
        "phone": "923000004",
        "whatsapp": "923000004",
        "open_hours": "Seg-Dom: 08:30 - 21:00",
        "is_premium": False,
        "status": BarberStatus.open,
    },
    {
        "name": "Classic Barbershop",
        "description": "Tradição e qualidade desde 2015. Cortes clássicos para o homem moderno.",
        "address": "Rua Rainha Ginga, Bengo",
        "city": "Bengo",
        "latitude": -9.0500,
        "longitude": 13.7200,
        "phone": "923000005",
        "whatsapp": "923000005",
        "open_hours": "Seg-Sáb: 09:00 - 18:00",
        "is_premium": False,
        "status": BarberStatus.paused,
    },
    {
        "name": "Gold Blade Studio",
        "description": "Arte e precisão em cada corte. O estúdio premium para quem exige o melhor.",
        "address": "Condomínio Jardins do Atlântico, Luanda",
        "city": "Luanda",
        "latitude": -8.9100,
        "longitude": 13.1900,
        "phone": "923000006",
        "whatsapp": "923000006",
        "open_hours": "Ter-Dom: 09:00 - 20:00",
        "is_premium": True,
        "status": BarberStatus.open,
    },
]

# Serviços base reutilizáveis
SERVICES_TEMPLATE = [
    {"name": "Corte Simples", "description": "Corte de cabelo clássico com máquina e tesoura", "price": 1500, "duration_minutes": 30},
    {"name": "Fade + Linha", "description": "Degradê moderno com linha definida", "price": 2500, "duration_minutes": 45},
    {"name": "Barba Completa", "description": "Aparar, definir e hidratar a barba", "price": 2000, "duration_minutes": 30},
    {"name": "Corte + Barba", "description": "Pacote completo: corte e barba", "price": 4000, "duration_minutes": 60},
    {"name": "Hidratação Capilar", "description": "Tratamento profundo para cabelos ressecados", "price": 3000, "duration_minutes": 45},
    {"name": "Sobrancelha", "description": "Design e definição de sobrancelhas", "price": 800, "duration_minutes": 15},
]


def seed():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    # 1. Criar utilizador barbeiro (dono de todas as barbearias de teste)
    barber = db.query(User).filter(User.email == "barbeiro@korta.ao").first()
    if not barber:
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
        print(f"✅ Utilizador criado: {barber.email}")
    else:
        print(f"ℹ️  Utilizador já existe: {barber.email}")

    # 2. Criar barbearias
    for shop_data in BARBERSHOPS:
        existing = db.query(Barbershop).filter(Barbershop.name == shop_data["name"]).first()
        if existing:
            print(f"ℹ️  Barbearia já existe: {shop_data['name']}")
            continue

        shop = Barbershop(owner_id=barber.id, **shop_data)
        db.add(shop)
        db.commit()
        db.refresh(shop)
        print(f"✅ Barbearia criada: {shop.name}")

        # 3. Criar serviços para cada barbearia
        for svc_data in SERVICES_TEMPLATE:
            svc = Service(barbershop_id=shop.id, is_active=True, **svc_data)
            db.add(svc)
        db.commit()
        print(f"   └─ {len(SERVICES_TEMPLATE)} serviços adicionados")

    db.close()
    print("\n🎉 Seed concluído com sucesso!")


if __name__ == "__main__":
    seed()
