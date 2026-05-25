import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db
from app.models import User, Review, Service

client = TestClient(app)

# Global variables to share states between tests
barber_token = None
client_token = None
active_shop_token = None
first_barbershop_id = None
barber_shop_id = None
created_service_id = None
created_photo_id = None


def test_public_barbershops():
    """Test listing public barbershops (unauthenticated)."""
    global first_barbershop_id
    response = client.get("/api/v1/barbershops")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    items = data["items"]
    assert isinstance(items, list)
    if len(items) > 0:
        first_barbershop_id = items[0]["id"]
        # Test public shop detail
        detail_resp = client.get(f"/api/v1/barbershops/{first_barbershop_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["id"] == first_barbershop_id


def test_barber_login():
    """Test login for the barber."""
    global barber_token
    payload = {
        "email": "serafim@korta.ao",
        "password": "korta123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    barber_token = data["access_token"]


def test_client_login():
    """Test login for a client."""
    global client_token
    payload = {
        "email": "abel@gmail.com",
        "password": "korta123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    client_token = data["access_token"]


def test_get_me():
    """Test GET /users/me using authenticated tokens."""
    # Barber profile
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "serafim@korta.ao"

    # Client profile
    headers = {"Authorization": f"Bearer {client_token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "abel@gmail.com"


def test_get_my_barbershops():
    """Test retrieving shops owned by the barber."""
    global barber_shop_id
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/barbershops/mine", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    barber_shop_id = data[0]["id"]


def test_switch_active_shop():
    """Test switching active barbershop and getting a new JWT."""
    global active_shop_token, barber_shop_id
    headers = {"Authorization": f"Bearer {barber_token}"}
    
    # First get own shops to get a valid ID if not set
    if not barber_shop_id:
        mine_resp = client.get("/api/v1/barbershops/mine", headers=headers)
        barber_shop_id = mine_resp.json()[0]["id"]

    payload = {"shop_id": barber_shop_id}
    response = client.post("/api/v1/barbershops/switch", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    active_shop_token = data["access_token"]


def test_get_active_bookings_no_active_shop():
    """Test GET /bookings fails without active shop in token."""
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/bookings", headers=headers)
    # Without active_shop_id in JWT payload, get_active_shop throws 400 Bad Request
    assert response.status_code == 400


def test_get_active_bookings_with_active_shop():
    """Test GET /bookings succeeds using the switched active shop token."""
    headers = {"Authorization": f"Bearer {active_shop_token}"}
    response = client.get("/api/v1/bookings", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_active_services_crud():
    """Test CRUD of services for the active shop."""
    global created_service_id
    headers = {"Authorization": f"Bearer {active_shop_token}"}

    # 1. List active services
    response = client.get("/api/v1/barbershops/active/services", headers=headers)
    assert response.status_code == 200
    initial_count = len(response.json())

    # 2. Create a service
    new_service = {
        "name": "Serviço de Teste Automático",
        "description": "Criado durante testes do pytest",
        "price": 3000,
        "duration_minutes": 45
    }
    create_resp = client.post("/api/v1/barbershops/active/services", headers=headers, json=new_service)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["name"] == "Serviço de Teste Automático"
    created_service_id = created_data["id"]

    # 3. Verify count increased
    list_resp = client.get("/api/v1/barbershops/active/services", headers=headers)
    assert len(list_resp.json()) == initial_count + 1

    # 4. Clean up service from database
    db = next(get_db())
    try:
        db.query(Service).filter(Service.id == created_service_id).delete()
        db.commit()
    finally:
        db.close()


def test_client_bookings():
    """Test GET /bookings/me for authenticated clients."""
    headers = {"Authorization": f"Bearer {client_token}"}
    response = client.get("/api/v1/bookings/me", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_barbershop_reviews():
    """Test retrieving and posting reviews."""
    global first_barbershop_id
    
    # Clean up any existing review by the test client for this shop so the test is reproducible
    db = next(get_db())
    try:
        client_user = db.query(User).filter(User.email == "abel@gmail.com").first()
        if client_user and first_barbershop_id:
            db.query(Review).filter(
                Review.user_id == client_user.id,
                Review.barbershop_id == first_barbershop_id
            ).delete()
            db.commit()
    finally:
        db.close()

    # 1. Retrieve reviews for the shop
    response = client.get(f"/api/v1/reviews/barbershop/{first_barbershop_id}")
    assert response.status_code == 200
    assert "items" in response.json()

    # 2. Post a review
    headers = {"Authorization": f"Bearer {client_token}"}
    new_review = {
        "barbershop_id": first_barbershop_id,
        "rating": 5,
        "comment": "Avaliação de teste automático por pytest."
    }
    post_resp = client.post("/api/v1/reviews", headers=headers, json=new_review)
    assert post_resp.status_code == 201
    assert post_resp.json()["comment"] == "Avaliação de teste automático por pytest."

    # Clean up review after test
    db = next(get_db())
    try:
        client_user = db.query(User).filter(User.email == "abel@gmail.com").first()
        if client_user and first_barbershop_id:
            db.query(Review).filter(
                Review.user_id == client_user.id,
                Review.barbershop_id == first_barbershop_id
            ).delete()
            db.commit()
    finally:
        db.close()


def test_barbershop_photos():
    """Test listing and uploading photos by URL."""
    global barber_shop_id, created_photo_id

    # 1. List photos
    response = client.get(f"/api/v1/photos/barbershop/{barber_shop_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # 2. Add photo by URL
    headers = {"Authorization": f"Bearer {barber_token}"}
    new_photo = {
        "barbershop_id": barber_shop_id,
        "url": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
        "public_id": "test_public_id",
        "photo_type": "haircut",
        "caption": "Foto de teste por pytest"
    }
    post_resp = client.post("/api/v1/photos", headers=headers, json=new_photo)
    assert post_resp.status_code == 201
    created_photo_id = post_resp.json()["id"]

    # 3. Delete photo
    del_resp = client.delete(f"/api/v1/photos/{created_photo_id}", headers=headers)
    assert del_resp.status_code == 204


def test_booking_lifecycle():
    """Test the complete life cycle of a booking: Creation -> Pending -> Confirmed -> Cancelled."""
    global barber_shop_id, client_token, barber_token, active_shop_token
    
    # 1. First get a service ID of barber_shop_id
    shop_resp = client.get(f"/api/v1/barbershops/{barber_shop_id}")
    assert shop_resp.status_code == 200
    services = shop_resp.json()["services"]
    assert len(services) > 0
    service_id = services[0]["id"]
    
    # 2. Client creates a booking
    client_headers = {"Authorization": f"Bearer {client_token}"}
    booking_payload = {
        "barbershop_id": barber_shop_id,
        "service_id": service_id,
        "date": "2026-06-01",
        "time_slot": "14:00",
        "notes": "Teste de ciclo de vida do agendamento."
    }
    
    # Let's clean up any existing booking for this slot to avoid conflict in the database
    from app.models import Booking
    db = next(get_db())
    try:
        db.query(Booking).filter(
            Booking.barbershop_id == barber_shop_id,
            Booking.date == "2026-06-01",
            Booking.time_slot == "14:00"
        ).delete()
        db.commit()
    finally:
        db.close()
        
    create_resp = client.post("/api/v1/bookings", headers=client_headers, json=booking_payload)
    assert create_resp.status_code == 201
    booking_data = create_resp.json()
    booking_id = booking_data["id"]
    assert booking_data["status"] == "pending"
    
    # 3. Barber checks bookings and confirms
    barber_headers = {"Authorization": f"Bearer {barber_token}"}
    status_payload = {"status": "confirmed"}
    
    confirm_resp = client.patch(f"/api/v1/bookings/{booking_id}/status", headers=barber_headers, json=status_payload)
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["status"] == "confirmed"
    
    # 4. Client verifies the booking is confirmed
    my_bookings_resp = client.get("/api/v1/bookings/me", headers=client_headers)
    assert my_bookings_resp.status_code == 200
    my_bookings = my_bookings_resp.json()
    client_booking = next((b for b in my_bookings if b["id"] == booking_id), None)
    assert client_booking is not None
    assert client_booking["status"] == "confirmed"
    
    # 5. Client cancels the booking
    cancel_payload = {"status": "cancelled"}
    cancel_resp = client.patch(f"/api/v1/bookings/{booking_id}/status", headers=client_headers, json=cancel_payload)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"
    
    # Clean up the booking after test to keep DB clean
    db = next(get_db())
    try:
        db.query(Booking).filter(Booking.id == booking_id).delete()
        db.commit()
    finally:
        db.close()


def test_booking_conflict_and_busy_slots():
    """Test retrieving busy slots and that making a booking on an already occupied slot returns 409 Conflict."""
    global barber_shop_id, client_token
    
    # 1. Get a service ID
    shop_resp = client.get(f"/api/v1/barbershops/{barber_shop_id}")
    assert shop_resp.status_code == 200
    services = shop_resp.json()["services"]
    assert len(services) > 0
    service_id = services[0]["id"]
    
    client_headers = {"Authorization": f"Bearer {client_token}"}
    date_str = "2026-06-02"
    slot_str = "15:00"
    
    # Clean up any pre-existing booking for safety
    from app.models import Booking
    db = next(get_db())
    try:
        db.query(Booking).filter(
            Booking.barbershop_id == barber_shop_id,
            Booking.date == date_str,
            Booking.time_slot == slot_str
        ).delete()
        db.commit()
    finally:
        db.close()


def test_dispatch_flow():
    """E2E: cliente cria booking_request e barbeiro aceita (dispatch flow)."""
    global client_token, barber_token, active_shop_token, barber_shop_id

    # 1) Garantir que o barbeiro está online
    headers_barber = {"Authorization": f"Bearer {barber_token}"}
    resp = client.post("/api/v1/users/me/online", headers=headers_barber, json={"is_online": True})
    assert resp.status_code == 200

    # 2) Obter um service_id da barbearia do barbeiro
    shop_resp = client.get(f"/api/v1/barbershops/{barber_shop_id}")
    assert shop_resp.status_code == 200
    services = shop_resp.json().get("services", [])
    assert len(services) > 0
    service_id = services[0]["id"]

    # 3) Cliente cria booking_request próximo à barbearia
    client_headers = {"Authorization": f"Bearer {client_token}"}
    shop_detail = shop_resp.json()
    lat = shop_detail.get("latitude") or -8.8383
    lng = shop_detail.get("longitude") or 13.2344
    payload = {"service_id": service_id, "lat": lat, "lng": lng, "radius_km": 5}

    create_req = client.post("/api/v1/bookings/request", headers=client_headers, json=payload)
    assert create_req.status_code == 201
    req = create_req.json()
    request_id = req["id"]

    # 4) Barbeiro aceita o pedido usando o token com active shop
    barber_headers = {"Authorization": f"Bearer {active_shop_token}"}
    accept_resp = client.post(f"/api/v1/bookings/requests/{request_id}/accept", headers=barber_headers)
    assert accept_resp.status_code == 201
    booking = accept_resp.json()
    assert booking["service_id"] == service_id

    # 5) Cliente deve ver a booking criada no seu histórico
    my_bookings_resp = client.get("/api/v1/bookings/me", headers=client_headers)
    assert my_bookings_resp.status_code == 200
    bookings = my_bookings_resp.json()
    assert any(b["id"] == booking["id"] for b in bookings)
        
    # 2. Create the first booking
    booking_payload = {
        "barbershop_id": barber_shop_id,
        "service_id": service_id,
        "date": date_str,
        "time_slot": slot_str,
        "notes": "Primeiro agendamento."
    }
    create_resp1 = client.post("/api/v1/bookings", headers=client_headers, json=booking_payload)
    assert create_resp1.status_code == 201
    booking1_id = create_resp1.json()["id"]
    
    # 3. Check busy slots
    busy_resp = client.get(
        f"/api/v1/bookings/busy-slots?barbershop_id={barber_shop_id}&date={date_str}",
        headers=client_headers
    )
    assert busy_resp.status_code == 200
    busy_slots = busy_resp.json()
    assert slot_str in busy_slots
    
    # 4. Try to create second booking on the same slot
    create_resp2 = client.post("/api/v1/bookings", headers=client_headers, json=booking_payload)
    assert create_resp2.status_code == 409
    assert create_resp2.json()["detail"] == "Horário já está ocupado"
    
    # Clean up
    db = next(get_db())
    try:
        db.query(Booking).filter(Booking.id == booking1_id).delete()
        db.commit()
    finally:
        db.close()


