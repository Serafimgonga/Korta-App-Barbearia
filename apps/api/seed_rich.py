"""
KORTA — Seed de dados fictícios completo
Cria barbearias, barbeiros, clientes, serviços, fotos, reviews e marcações.
Uso:  cd apps/api && ./venv/bin/python seed_rich.py
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import (
    Base, User, Barbershop, Service, ServicePhoto, Booking, Review, Photo,
    UserRole, BarberStatus, BookingStatus, PhotoType
)
from app.core.security import hash_password
from datetime import datetime, timedelta
import random

# ── Fotos reais via Unsplash (CDN gratuito, sem autenticação) ─────────────────
HAIRCUT_PHOTOS = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800",
    "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=800",
    "https://images.unsplash.com/photo-1560869713-bf1c6f566e1c?w=800",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800",
]

EXTERIOR_PHOTOS = [
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
    "https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=800",
]

INTERIOR_PHOTOS = [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800",
    "https://images.unsplash.com/photo-1582095133179-bfd08e2533ef?w=800",
]

AVATAR_PHOTOS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200",
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=200",
    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200",
]

# ── Barbeiros (proprietários das barbearias) ──────────────────────────────────
BARBERS = [
    {"name": "Serafim Gonga",   "email": "serafim@korta.ao",   "phone": "923000001", "avatar": AVATAR_PHOTOS[0]},
    {"name": "João Mbala",       "email": "joao@korta.ao",       "phone": "923000002", "avatar": AVATAR_PHOTOS[1]},
    {"name": "Carlos Lussati",   "email": "carlos@korta.ao",     "phone": "923000003", "avatar": AVATAR_PHOTOS[2]},
    {"name": "André Muteka",     "email": "andre@korta.ao",      "phone": "923000004", "avatar": AVATAR_PHOTOS[3]},
    {"name": "Pedro Ngola",      "email": "pedro@korta.ao",      "phone": "923000005", "avatar": AVATAR_PHOTOS[4]},
]

# ── Clientes ──────────────────────────────────────────────────────────────────
CLIENTS = [
    {"name": "Abel Ferreira",    "email": "abel@gmail.com",   "phone": "924001001", "avatar": AVATAR_PHOTOS[5]},
    {"name": "Bruno Tavares",    "email": "bruno@gmail.com",  "phone": "924001002", "avatar": AVATAR_PHOTOS[6]},
    {"name": "David Neto",       "email": "david@gmail.com",  "phone": "924001003", "avatar": AVATAR_PHOTOS[7]},
    {"name": "Emanuel Costa",    "email": "ema@gmail.com",    "phone": "924001004", "avatar": AVATAR_PHOTOS[0]},
    {"name": "Francisco Dias",   "email": "chico@gmail.com",  "phone": "924001005", "avatar": AVATAR_PHOTOS[1]},
    {"name": "Gonçalo Pinto",    "email": "gon@gmail.com",    "phone": "924001006", "avatar": AVATAR_PHOTOS[2]},
    {"name": "Hugo Mendes",      "email": "hugo@gmail.com",   "phone": "924001007", "avatar": AVATAR_PHOTOS[3]},
    {"name": "Ivo Santos",       "email": "ivo@gmail.com",    "phone": "924001008", "avatar": AVATAR_PHOTOS[4]},
]

# ── Barbearias completas ──────────────────────────────────────────────────────
BARBERSHOPS = [
    {
        "name": "KORTA Premium Club",
        "description": "A barbearia número 1 de Ícolo e Bengo. Estilo, tradição e excelência. Especializados em fades, barbas e tratamentos premium. Ambiente moderno e acolhedor.",
        "address": "Rua da Independência, km 30, Kissama",
        "city": "Ícolo e Bengo",
        "province": "Luanda",
        "latitude": -9.1333, "longitude": 13.4833,
        "phone": "923100001", "whatsapp": "923100001",
        "open_hours": "Seg-Sáb: 08:00 - 20:00 | Dom: 09:00 - 16:00",
        "is_premium": True, "status": BarberStatus.open,
        "barber_idx": 0,
        "avg_rating": 4.9, "total_reviews": 48,
    },
    {
        "name": "Barbearia do Zé",
        "description": "Cortes clássicos e modernos ao melhor preço. Ambiente familiar e descontraído. O ponto de encontro dos homens da Viana.",
        "address": "Avenida 4 de Fevereiro, Viana",
        "city": "Viana",
        "province": "Luanda",
        "latitude": -8.9053, "longitude": 13.3749,
        "phone": "923100002", "whatsapp": "923100002",
        "open_hours": "Seg-Sex: 09:00 - 19:00 | Sáb: 08:00 - 17:00",
        "is_premium": False, "status": BarberStatus.open,
        "barber_idx": 1,
        "avg_rating": 4.5, "total_reviews": 32,
    },
    {
        "name": "UrbanCuts Studio",
        "description": "Barbearia moderna especializada em estilos urbanos, barbas e sobrancelhas. Experiência premium no Cacuaco com os melhores profissionais.",
        "address": "Rua Mártires de Kifangondo, Cacuaco",
        "city": "Cacuaco",
        "province": "Luanda",
        "latitude": -8.7800, "longitude": 13.3660,
        "phone": "923100003", "whatsapp": "923100003",
        "open_hours": "Ter-Dom: 10:00 - 21:00",
        "is_premium": True, "status": BarberStatus.open,
        "barber_idx": 2,
        "avg_rating": 4.7, "total_reviews": 61,
    },
    {
        "name": "Barber King",
        "description": "O rei dos cortes em Luanda. Especialistas em fade, linha e barba. Venha ser rei! Equipamentos de última geração e profissionais certificados.",
        "address": "Largo do Ambiente, Km 28, Luanda",
        "city": "Luanda",
        "province": "Luanda",
        "latitude": -8.8383, "longitude": 13.2344,
        "phone": "923100004", "whatsapp": "923100004",
        "open_hours": "Seg-Dom: 08:30 - 21:00",
        "is_premium": False, "status": BarberStatus.open,
        "barber_idx": 3,
        "avg_rating": 4.3, "total_reviews": 27,
    },
    {
        "name": "Gold Blade Studio",
        "description": "Arte e precisão em cada corte. O estúdio premium para quem exige o melhor. Produtos internacionais, ambiente exclusivo, atendimento personalizado.",
        "address": "Condomínio Jardins do Atlântico, Talatona, Luanda",
        "city": "Talatona",
        "province": "Luanda",
        "latitude": -8.9100, "longitude": 13.1900,
        "phone": "923100005", "whatsapp": "923100005",
        "open_hours": "Ter-Dom: 09:00 - 20:00",
        "is_premium": True, "status": BarberStatus.open,
        "barber_idx": 4,
        "avg_rating": 4.8, "total_reviews": 55,
    },
    {
        "name": "Classic Barbershop",
        "description": "Tradição e qualidade desde 2015. Cortes clássicos para o homem moderno. O lugar onde o estilo encontra a tradição angolana.",
        "address": "Rua Rainha Ginga, Bengo",
        "city": "Bengo",
        "province": "Bengo",
        "latitude": -9.0500, "longitude": 13.7200,
        "phone": "923100006", "whatsapp": "923100006",
        "open_hours": "Seg-Sáb: 09:00 - 18:00",
        "is_premium": False, "status": BarberStatus.paused,
        "barber_idx": 0,
        "avg_rating": 4.1, "total_reviews": 19,
    },
    {
        "name": "Elite Cuts Luanda",
        "description": "Onde a elite vai cortar o cabelo. Ambiente luxuoso, serviços premium, bebidas cortesia. A melhor experiência de barbearia de Angola.",
        "address": "Av. Marginal, Ingombota, Luanda",
        "city": "Luanda",
        "province": "Luanda",
        "latitude": -8.8271, "longitude": 13.2330,
        "phone": "923100007", "whatsapp": "923100007",
        "open_hours": "Seg-Dom: 09:00 - 22:00",
        "is_premium": True, "status": BarberStatus.open,
        "barber_idx": 1,
        "avg_rating": 4.95, "total_reviews": 83,
    },
    {
        "name": "Razor Sharp",
        "description": "Precisão de navalha, resultados de alto nível. Especializados em penteados afro, dreads e cortes artísticos. Venha mostrar a sua personalidade.",
        "address": "Bairro Palanca, Km 14, Luanda",
        "city": "Luanda",
        "province": "Luanda",
        "latitude": -8.8600, "longitude": 13.2800,
        "phone": "923100008", "whatsapp": "923100008",
        "open_hours": "Seg-Sáb: 10:00 - 20:00",
        "is_premium": False, "status": BarberStatus.open,
        "barber_idx": 2,
        "avg_rating": 4.6, "total_reviews": 41,
    },
]

# ── Serviços por barbearia (varia conforme premium ou não) ────────────────────
SERVICES_PREMIUM = [
    {"name": "Corte Premium",         "description": "Corte personalizado com consulta de estilo", "price": 4500, "duration_minutes": 60},
    {"name": "Fade + Linha Gold",     "description": "Degradê perfeito com linha definida e hidratação", "price": 6000, "duration_minutes": 75},
    {"name": "Barba VIP",             "description": "Barba completa com navalha quente, óleo e massagem", "price": 4000, "duration_minutes": 45},
    {"name": "Corte + Barba Gold",    "description": "Pacote completo premium: corte, barba e tratamento", "price": 9000, "duration_minutes": 90},
    {"name": "Hidratação Capilar Pro","description": "Tratamento profundo com produtos internacionais", "price": 5500, "duration_minutes": 60},
    {"name": "Sobrancelha Design",    "description": "Design e definição de sobrancelhas com cera", "price": 1500, "duration_minutes": 20},
    {"name": "Coloração",             "description": "Coloração de cabelo ou barba com produtos premium", "price": 8000, "duration_minutes": 90},
    {"name": "Tratamento Anticaspa",  "description": "Shampoo + tratamento especializado anticaspa", "price": 3500, "duration_minutes": 30},
]

SERVICES_STANDARD = [
    {"name": "Corte Simples",         "description": "Corte de cabelo clássico com máquina e tesoura", "price": 1500, "duration_minutes": 30},
    {"name": "Fade + Linha",          "description": "Degradê moderno com linha definida", "price": 2500, "duration_minutes": 45},
    {"name": "Barba Completa",        "description": "Aparar, definir e hidratar a barba", "price": 2000, "duration_minutes": 30},
    {"name": "Corte + Barba",         "description": "Pacote completo: corte e barba", "price": 4000, "duration_minutes": 60},
    {"name": "Hidratação Capilar",    "description": "Tratamento profundo para cabelos ressecados", "price": 3000, "duration_minutes": 45},
    {"name": "Sobrancelha",           "description": "Design e definição de sobrancelhas", "price": 800,  "duration_minutes": 15},
]

# ── Reviews por barbearia ─────────────────────────────────────────────────────
REVIEW_TEMPLATES = [
    (5, "Simplesmente incrível! Melhor barbearia que já fui em Angola. O barbeiro é um artista!"),
    (5, "Atendimento de primeira. O ambiente é muito agradável e o resultado ficou perfeito."),
    (4, "Muito bom! Recomendo a todos. Só demorou um pouco mais do que o esperado."),
    (5, "O fade ficou perfeito! Voltarei com certeza. Preço justo pela qualidade."),
    (4, "Boa barbearia, bom ambiente. O barbeiro é experiente e atencioso."),
    (5, "Melhor corte que já tive! A barba ficou impecável. Vale cada kwanza."),
    (3, "Bom serviço mas estava muito cheio. Tive que esperar quase 1 hora."),
    (5, "Profissionalismo a 100%! Conhecem o que fazem. Já trouxe os meus amigos."),
    (4, "Corte limpo e rápido. Staff simpático. Fica um pouco longe mas vale a pena."),
    (5, "A experiência completa! Música boa, staff educado e o corte ficou top."),
    (4, "Recomendo! Bom preço e qualidade acima da média. A barba com navalha é excelente."),
    (5, "O melhor barbeiro de Luanda está aqui! Nível internacional de qualidade."),
]


def clear_data(db: Session):
    """Limpar dados existentes (mantém os que já existem por email)."""
    print("🗑️  A verificar dados existentes...")


def create_barbers(db: Session):
    barbers = []
    for b in BARBERS:
        existing = db.query(User).filter(User.email == b["email"]).first()
        if existing:
            print(f"   ℹ️  Barbeiro já existe: {b['email']}")
            barbers.append(existing)
        else:
            user = User(
                name=b["name"],
                email=b["email"],
                phone=b["phone"],
                hashed_password=hash_password("korta123"),
                role=UserRole.barber,
                avatar_url=b["avatar"],
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"   ✅ Barbeiro criado: {user.name} ({user.email})")
            barbers.append(user)
    return barbers


def create_clients(db: Session):
    clients = []
    for c in CLIENTS:
        existing = db.query(User).filter(User.email == c["email"]).first()
        if existing:
            print(f"   ℹ️  Cliente já existe: {c['email']}")
            clients.append(existing)
        else:
            user = User(
                name=c["name"],
                email=c["email"],
                phone=c["phone"],
                hashed_password=hash_password("korta123"),
                role=UserRole.client,
                avatar_url=c["avatar"],
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"   ✅ Cliente criado: {user.name}")
            clients.append(user)
    return clients


def create_barbershops(db: Session, barbers: list):
    shops = []
    for data in BARBERSHOPS:
        existing = db.query(Barbershop).filter(Barbershop.name == data["name"]).first()
        if existing:
            print(f"   ℹ️  Barbearia já existe: {data['name']}")
            shops.append(existing)
            continue

        barber_idx = data.pop("barber_idx")
        avg_rating = data.pop("avg_rating")
        total_rev = data.pop("total_reviews")

        shop = Barbershop(
            owner_id=barbers[barber_idx].id,
            average_rating=avg_rating,
            total_reviews=total_rev,
            is_active=True,
            **data,
        )
        db.add(shop)
        db.commit()
        db.refresh(shop)
        print(f"   ✅ Barbearia criada: {shop.name} ({avg_rating}⭐ | {total_rev} reviews)")
        shops.append(shop)
    return shops


def create_services(db: Session, shops: list):
    for shop in shops:
        existing = db.query(Service).filter(Service.barbershop_id == shop.id).first()
        if existing:
            continue
        template = SERVICES_PREMIUM if shop.is_premium else SERVICES_STANDARD
        for idx, svc_data in enumerate(template):
            svc = Service(barbershop_id=shop.id, is_active=True, **svc_data)
            db.add(svc)
            db.flush()  # Obter o id do serviço criado

            # Adicionar fotos reais de demonstração ao serviço (especialmente para Corte/Fade/Barba)
            if any(term in svc.name.lower() for term in ["corte", "fade", "barba"]):
                # Adiciona 3 fotos de demonstração de trabalhos realizados
                num_photos = 3
                for i in range(num_photos):
                    photo_idx = (idx * 3 + i) % len(HAIRCUT_PHOTOS)
                    db.add(ServicePhoto(
                        service_id=svc.id,
                        shop_id=shop.id,
                        url=HAIRCUT_PHOTOS[photo_idx],
                        caption=f"Demonstração de {svc.name} - {shop.name}",
                        display_order=i,
                        uploaded_by=shop.owner_id
                    ))
        db.commit()
        print(f"   ✅ {len(template)} serviços (com fotos reais integradas) → {shop.name}")


def create_photos(db: Session, shops: list):
    for shop in shops:
        existing = db.query(Photo).filter(Photo.barbershop_id == shop.id).first()
        if existing:
            continue

        # 4-6 fotos de corte
        num_haircuts = 6 if shop.is_premium else 4
        for i in range(num_haircuts):
            db.add(Photo(
                barbershop_id=shop.id,
                url=HAIRCUT_PHOTOS[i % len(HAIRCUT_PHOTOS)],
                photo_type=PhotoType.haircut,
                caption=f"Corte #{i+1} — {shop.name}",
            ))

        # 1-2 fotos de exterior
        db.add(Photo(
            barbershop_id=shop.id,
            url=EXTERIOR_PHOTOS[shops.index(shop) % len(EXTERIOR_PHOTOS)],
            photo_type=PhotoType.exterior,
            caption=f"Fachada — {shop.name}",
        ))

        # 1-2 fotos de interior
        db.add(Photo(
            barbershop_id=shop.id,
            url=INTERIOR_PHOTOS[shops.index(shop) % len(INTERIOR_PHOTOS)],
            photo_type=PhotoType.interior,
            caption=f"Interior — {shop.name}",
        ))

        db.commit()
        total = num_haircuts + 2
        print(f"   ✅ {total} fotos → {shop.name}")


def create_reviews(db: Session, shops: list, clients: list):
    for shop in shops:
        existing = db.query(Review).filter(Review.barbershop_id == shop.id).first()
        if existing:
            continue

        # Número de reviews proporcional ao total_reviews registado
        num = min(len(REVIEW_TEMPLATES), max(3, shop.total_reviews // 5))
        chosen = random.sample(REVIEW_TEMPLATES, num)
        for i, (rating, comment) in enumerate(chosen):
            client = clients[i % len(clients)]
            db.add(Review(
                user_id=client.id,
                barbershop_id=shop.id,
                rating=rating,
                comment=comment,
            ))
        db.commit()
        print(f"   ✅ {num} reviews → {shop.name}")


def create_bookings(db: Session, shops: list, clients: list):
    for shop in shops:
        existing = db.query(Booking).filter(Booking.barbershop_id == shop.id).first()
        if existing:
            continue

        services = db.query(Service).filter(Service.barbershop_id == shop.id).all()
        if not services:
            continue

        statuses = [BookingStatus.completed, BookingStatus.completed,
                    BookingStatus.confirmed, BookingStatus.pending]
        time_slots = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"]

        for i in range(6):
            client = clients[i % len(clients)]
            service = services[i % len(services)]
            days_ago = random.randint(1, 30)
            date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            status = statuses[i % len(statuses)]

            db.add(Booking(
                user_id=client.id,
                barbershop_id=shop.id,
                service_id=service.id,
                date=date,
                time_slot=time_slots[i % len(time_slots)],
                status=status,
                total_price=service.price,
                notes=None,
            ))
        db.commit()
        print(f"   ✅ 6 marcações → {shop.name}")


def seed():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    print("\n" + "="*55)
    print("  💈 KORTA — Seed de Dados Completo")
    print("="*55)

    print("\n👤 A criar barbeiros...")
    barbers = create_barbers(db)

    print("\n👥 A criar clientes...")
    clients = create_clients(db)

    print("\n🏪 A criar barbearias...")
    shops = create_barbershops(db, barbers)

    print("\n✂️  A criar serviços...")
    create_services(db, shops)

    print("\n📸 A criar fotos...")
    create_photos(db, shops)

    print("\n⭐ A criar reviews...")
    create_reviews(db, shops, clients)

    print("\n📅 A criar marcações...")
    create_bookings(db, shops, clients)

    total_services = sum(8 if s.is_premium else 6 for s in shops)
    total_photos = sum(8 if s.is_premium else 6 for s in shops)

    db.close()

    print("\n" + "="*55)
    print("  🎉 Seed concluído com sucesso!")
    print("="*55)
    print(f"\n  📊 Resumo:")
    print(f"     • {len(barbers)} barbeiros criados")
    print(f"     • {len(clients)} clientes criados")
    print(f"     • {len(shops)} barbearias criadas")
    print(f"     • {sum(8 if s.is_premium else 6 for s in shops)} serviços no total")
    print(f"     • Fotos, reviews e marcações geradas ✅")
    print(f"\n  🔑 Login de teste:")
    print(f"     Email:  serafim@korta.ao  |  Senha: korta123")
    print(f"     Email:  abel@gmail.com    |  Senha: korta123")
    print("="*55 + "\n")


if __name__ == "__main__":
    seed()
