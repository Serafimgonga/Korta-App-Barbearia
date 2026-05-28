"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  KORTA — Teste E2E: Serviço em Casa (Barbeiro vai ao Cliente) — Realtime    ║
║                                                                              ║
║  Fluxo testado:                                                              ║
║   1. Login: Cliente e Barbeiro autenticam-se                                 ║
║   2. Barbeiro: fica online + selecciona barbearia activa                     ║
║   3. Cliente: liga WebSocket para receber notificações em tempo real         ║
║   4. Barbeiro: liga WebSocket para receber novos pedidos em tempo real       ║
║   5. Cliente: cria BookingRequest (barbeiro vai ao cliente)                  ║
║   6. Barbeiro: recebe notificação WS "new_booking_request" em tempo real     ║
║   7. Barbeiro: aceita o pedido via API REST                                  ║
║   8. Cliente: recebe notificação WS "booking_request_accepted" em tempo real ║
║   9. Barbeiro: actualiza booking → "confirmed" → "completed"                 ║
║  10. Verificações finais de estado                                           ║
║                                                                              ║
║  Pré-requisitos:                                                             ║
║   - API a correr em localhost:8000                                           ║
║   - Base de dados inicializada com seed_test.py                              ║
║   - pip install requests websockets                                          ║
║                                                                              ║
║  Execução:                                                                   ║
║   cd apps/api && ./venv/bin/python tests/test_home_service_realtime.py       ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import queue
import threading
import time
import sys
import requests
import websockets

# ─── Configuração ─────────────────────────────────────────────────────────────

BASE_URL   = "http://localhost:8000/api/v1"
WS_URL     = "ws://localhost:8000/ws/notifications"
TIMEOUT    = 20   # segundos máximos a esperar por notificações WS

# Credenciais do seed_test.py
CLIENT_EMAIL    = "abel@gmail.com"
CLIENT_PASSWORD = "korta123"
BARBER_EMAIL    = "serafim@korta.ao"
BARBER_PASSWORD = "korta123"

# Coordenadas de teste — Ícolo e Bengo (onde estão as barbearias do seed)
CLIENT_LAT = -9.1333
CLIENT_LNG = 13.4833

# ─── Cores ANSI para output bonito ────────────────────────────────────────────

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    BLUE   = "\033[94m"
    CYAN   = "\033[96m"
    RED    = "\033[91m"
    GREY   = "\033[90m"
    PURPLE = "\033[95m"

# ─── Utilitários de logging ────────────────────────────────────────────────────

def step(n: int, msg: str):
    print(f"\n{C.BOLD}{C.BLUE}[PASSO {n}]{C.RESET} {msg}")

def ok(msg: str):
    print(f"  {C.GREEN}✔{C.RESET}  {msg}")

def info(msg: str):
    print(f"  {C.CYAN}ℹ{C.RESET}  {msg}")

def warn(msg: str):
    print(f"  {C.YELLOW}⚠{C.RESET}  {msg}")

def fail(msg: str):
    print(f"  {C.RED}✘{C.RESET}  {msg}")
    sys.exit(1)

def ws_event(actor: str, msg: str):
    color = C.PURPLE if actor == "BARBEIRO" else C.CYAN
    print(f"  {color}[WS {actor}]{C.RESET} {msg}")

def divider(title: str = ""):
    line = "─" * 60
    if title:
        pad = (58 - len(title)) // 2
        print(f"\n{C.GREY}┌{'─'*pad} {title} {'─'*pad}┐{C.RESET}")
    else:
        print(f"{C.GREY}{line}{C.RESET}")

# ─── HTTP helpers ──────────────────────────────────────────────────────────────

def api_post(path: str, data: dict, token: str | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    r = requests.post(f"{BASE_URL}{path}", json=data, headers=headers, timeout=10)
    if not r.ok:
        fail(f"POST {path} → {r.status_code}: {r.text}")
    return r.json()

def api_get(path: str, token: str, params: dict | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}{path}", headers=headers, params=params, timeout=10)
    if not r.ok:
        fail(f"GET {path} → {r.status_code}: {r.text}")
    return r.json()

def api_patch(path: str, data: dict, token: str) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.patch(f"{BASE_URL}{path}", json=data, headers=headers, timeout=10)
    if not r.ok:
        fail(f"PATCH {path} → {r.status_code}: {r.text}")
    return r.json()

def api_put(path: str, data: dict, token: str) -> dict:
    """Alias mantido para compatibilidade — usa POST internamente."""
    return api_post(path, data, token)

# ─── WebSocket listener (executa em thread separada) ──────────────────────────

def ws_listener_thread(token: str, msg_queue: queue.Queue, stop_event: threading.Event):
    """Escuta notificações WebSocket e coloca-as na fila."""
    async def _run():
        uri = f"{WS_URL}?token={token}"
        try:
            async with websockets.connect(uri, ping_interval=5, close_timeout=5) as ws:
                msg_queue.put({"__status__": "connected"})
                while not stop_event.is_set():
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=1.0)
                        data = json.loads(raw)
                        msg_queue.put(data)
                    except asyncio.TimeoutError:
                        continue
                    except websockets.ConnectionClosed:
                        break
        except Exception as e:
            msg_queue.put({"__error__": str(e)})

    asyncio.run(_run())


def start_ws_listener(token: str) -> tuple[queue.Queue, threading.Event, threading.Thread]:
    q = queue.Queue()
    stop = threading.Event()
    t = threading.Thread(target=ws_listener_thread, args=(token, q, stop), daemon=True)
    t.start()
    return q, stop, t


def wait_for_ws_message(q: queue.Queue, expected_type: str, timeout: int = TIMEOUT) -> dict:
    """Bloqueia até receber mensagem WS do tipo esperado ou lança erro."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            msg = q.get(timeout=1)
            if "__status__" in msg:
                continue  # mensagem de estado interno
            if "__error__" in msg:
                fail(f"Erro WebSocket: {msg['__error__']}")
            if msg.get("type") == expected_type:
                return msg
            # guarda outras mensagens para não perder
            warn(f"WS recebeu mensagem inesperada (ignorada): type={msg.get('type')}")
        except queue.Empty:
            continue
    fail(f"Timeout: mensagem WS '{expected_type}' não recebida em {timeout}s")


def wait_for_ws_connected(q: queue.Queue, timeout: int = 10):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            msg = q.get(timeout=1)
            if msg.get("__status__") == "connected":
                return
            if msg.get("__error__"):
                fail(f"WebSocket não conectou: {msg['__error__']}")
        except queue.Empty:
            continue
    fail("WebSocket não conectou dentro do tempo limite")

# ══════════════════════════════════════════════════════════════════════════════
#  TESTES
# ══════════════════════════════════════════════════════════════════════════════

def run_tests():
    divider("KORTA — Teste Realtime: Barbeiro vai ao Cliente")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 1 — Login do Cliente
    # ─────────────────────────────────────────────────────────────────────────
    step(1, f"Login do Cliente ({CLIENT_EMAIL})")
    client_tokens = api_post("/auth/login", {
        "email": CLIENT_EMAIL,
        "password": CLIENT_PASSWORD,
    })
    client_token = client_tokens["access_token"]
    assert client_token, "Token do cliente vazio"
    ok(f"Cliente autenticado — token: {client_token[:30]}…")

    client_me = api_get("/users/me", client_token)
    info(f"Cliente: {client_me['name']} (id={client_me['id']}, role={client_me['role']})")
    assert client_me["role"] == "client", f"Esperava role=client, obteve: {client_me['role']}"
    client_id = client_me["id"]

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 2 — Login do Barbeiro
    # ─────────────────────────────────────────────────────────────────────────
    step(2, f"Login do Barbeiro ({BARBER_EMAIL})")
    barber_tokens = api_post("/auth/login", {
        "email": BARBER_EMAIL,
        "password": BARBER_PASSWORD,
    })
    barber_token = barber_tokens["access_token"]
    assert barber_token, "Token do barbeiro vazio"
    ok(f"Barbeiro autenticado — token: {barber_token[:30]}…")

    barber_me = api_get("/users/me", barber_token)
    info(f"Barbeiro: {barber_me['name']} (id={barber_me['id']}, role={barber_me['role']})")
    assert barber_me["role"] == "barber", f"Esperava role=barber, obteve: {barber_me['role']}"
    barber_id = barber_me["id"]

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 3 — Barbeiro fica Online
    # ─────────────────────────────────────────────────────────────────────────
    step(3, "Barbeiro marca-se como Online (disponível para pedidos)")
    online_resp = api_post("/users/me/online", {"is_online": True}, barber_token)
    assert online_resp.get("is_online") is True, "Barbeiro não ficou online!"
    ok("Barbeiro está ONLINE ✓")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 4 — Barbeiro selecciona barbearia activa (shop switch)
    # ─────────────────────────────────────────────────────────────────────────
    step(4, "Barbeiro obtém lista de barbearias e faz shop switch")
    shops = api_get("/barbershops/mine", barber_token)
    assert shops, "Barbeiro não tem barbearias!"
    shop = shops[0]
    info(f"Barbearia seleccionada: '{shop['name']}' (id={shop['id']}, cidade={shop['city']})")

    switch_resp = api_post("/barbershops/switch", {"shop_id": shop["id"]}, barber_token)
    barber_shop_token = switch_resp["access_token"]
    assert barber_shop_token, "Token após switch vazio"
    ok(f"Shop switch efectuado — nova barbearia activa: {shop['name']}")
    shop_id    = shop["id"]

    # Obter o primeiro serviço activo da barbearia para usar no pedido
    shop_detail = api_get(f"/barbershops/{shop_id}", barber_token)
    services = [s for s in shop_detail.get("services", []) if s.get("is_active")]
    assert services, "Barbearia não tem serviços activos!"
    service = services[0]
    info(f"Serviço escolhido para o pedido: '{service['name']}' (id={service['id']}, preço={service['price']} Kz)")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 5 — WebSocket: Cliente e Barbeiro ligam-se
    # ─────────────────────────────────────────────────────────────────────────
    step(5, "Estabelecer ligações WebSocket (Cliente e Barbeiro)")

    client_q, client_stop, client_ws_thread = start_ws_listener(client_token)
    wait_for_ws_connected(client_q)
    ws_event("CLIENTE", f"Ligado ao WebSocket (/ws/notifications?token=…) ✓")

    barber_q, barber_stop, barber_ws_thread = start_ws_listener(barber_shop_token)
    wait_for_ws_connected(barber_q)
    ws_event("BARBEIRO", f"Ligado ao WebSocket (/ws/notifications?token=…) ✓")

    time.sleep(0.5)  # garantir que as conexões estão registadas no servidor

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 6 — Cliente cria BookingRequest (serviço em casa)
    # ─────────────────────────────────────────────────────────────────────────
    step(6, "Cliente cria pedido de serviço em casa (BookingRequest)")

    booking_request_data = {
        "service_id": service["id"],
        "lat": CLIENT_LAT,
        "lng": CLIENT_LNG,
        "radius_km": 15,
    }
    info(f"Payload: {json.dumps(booking_request_data, indent=2)}")

    request_resp = api_post("/bookings/request", booking_request_data, client_token)
    request_id   = request_resp["id"]
    assert request_id, "BookingRequest não criado!"
    assert request_resp.get("status") in ("requested", "matching", None), \
        f"Estado inesperado: {request_resp.get('status')}"

    ok(f"BookingRequest criado! id={request_id}, status={request_resp.get('status', 'N/A')}")
    info(f"Coordenadas: lat={CLIENT_LAT}, lng={CLIENT_LNG}, raio={booking_request_data['radius_km']} km")
    info(f"Serviço solicitado: id={service['id']} — '{service['name']}'")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 7 — Barbeiro recebe notificação WS "new_booking_request"
    # ─────────────────────────────────────────────────────────────────────────
    step(7, f"Barbeiro aguarda notificação WS «new_booking_request» (timeout={TIMEOUT}s)…")

    barber_notif = wait_for_ws_message(barber_q, "new_booking_request", timeout=TIMEOUT)
    ws_event("BARBEIRO", f"📩 Notificação recebida: {json.dumps(barber_notif, indent=2, ensure_ascii=False)}")

    assert barber_notif.get("type") == "new_booking_request"
    req_payload = barber_notif.get("request", {})
    assert req_payload.get("id") == request_id, \
        f"ID do pedido diferente: esperava {request_id}, obteve {req_payload.get('id')}"
    assert req_payload.get("service_id") == service["id"], "service_id errado na notificação"
    ok(f"✓ Notificação correcta! id={req_payload['id']}, serviço='{req_payload.get('service_name')}', preço={req_payload.get('price')} Kz")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 8 — Verificar estado do BookingRequest após notificação WS
    # ─────────────────────────────────────────────────────────────────────────
    step(8, "Cliente verifica estado do BookingRequest (após dispatch)")
    req_check = api_get(f"/bookings/request/{request_id}", client_token)
    req_status = req_check.get("status")
    info(f"Estado actual do BookingRequest #{request_id}: '{req_status}'")
    # Após o dispatch, o status muda para 'matching' (barbeiro a ser contactado)
    # ou pode já ter ido para 'assigned' se o accept foi rápido
    assert req_status in ("requested", "matching", "assigned"), \
        f"Estado inesperado: '{req_status}'"
    ok(f"BookingRequest #{request_id} estado='{req_status}' ✓ (dispatcher activo)")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 9 — Barbeiro aceita o pedido
    # ─────────────────────────────────────────────────────────────────────────
    step(9, f"Barbeiro aceita o pedido #{request_id}")
    time.sleep(0.3)

    accept_resp = api_post(
        f"/bookings/requests/{request_id}/accept",
        {},
        barber_shop_token
    )
    booking_id = accept_resp["id"]
    assert booking_id, "Booking não criado após aceitação!"
    ok(f"Pedido aceite! Booking criado: id={booking_id}, status={accept_resp.get('status')}")
    info(f"Barbershop: {accept_resp.get('barbershop_id')}, Serviço: {accept_resp.get('service_id')}")
    info(f"Data/hora: {accept_resp.get('date')} às {accept_resp.get('time_slot')}")
    info(f"Preço total: {accept_resp.get('total_price')} Kz")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 10 — Cliente recebe notificação WS "booking_request_accepted"
    # ─────────────────────────────────────────────────────────────────────────
    step(10, f"Cliente aguarda notificação WS «booking_request_accepted» (timeout={TIMEOUT}s)…")

    client_notif = wait_for_ws_message(client_q, "booking_request_accepted", timeout=TIMEOUT)
    ws_event("CLIENTE", f"🔔 Notificação recebida: {json.dumps(client_notif, indent=2, ensure_ascii=False)}")

    assert client_notif.get("type") == "booking_request_accepted"
    assert client_notif.get("request_id") == request_id, \
        f"request_id errado: esperava {request_id}, obteve {client_notif.get('request_id')}"
    assert client_notif.get("booking_id") == booking_id, \
        f"booking_id errado: esperava {booking_id}, obteve {client_notif.get('booking_id')}"

    ok(f"✓ Cliente notificado correctamente!")
    ok(f"  Mensagem: \"{client_notif.get('message')}\"")
    ok(f"  Barbearia: {client_notif.get('barbershop_name')}")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 11 — Verificar estado final do BookingRequest (deve ser 'assigned')
    # ─────────────────────────────────────────────────────────────────────────
    step(11, "Cliente verifica que BookingRequest ficou 'assigned'")
    req_final = api_get(f"/bookings/request/{request_id}", client_token)
    req_final_status = req_final.get("status")
    info(f"Estado final do BookingRequest #{request_id}: '{req_final_status}'")
    assert req_final_status == "assigned", \
        f"Esperava status='assigned', obteve: '{req_final_status}'"
    ok(f"BookingRequest #{request_id} status='assigned' ✓ (barbeiro atribuído com sucesso)")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 12 — Barbeiro confirma o booking
    # ─────────────────────────────────────────────────────────────────────────
    step(12, f"Barbeiro confirma o Booking #{booking_id} (pending → confirmed)")
    confirmed = api_patch(
        f"/bookings/{booking_id}/status",
        {"status": "confirmed"},
        barber_shop_token
    )
    assert confirmed.get("status") == "confirmed", \
        f"Esperava status=confirmed, obteve: {confirmed.get('status')}"
    ok(f"Booking #{booking_id} confirmado ✓")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 13 — Barbeiro conclui o serviço (confirmed → completed)
    # ─────────────────────────────────────────────────────────────────────────
    step(13, f"Barbeiro conclui o serviço (confirmed → completed)")
    completed = api_patch(
        f"/bookings/{booking_id}/status",
        {"status": "completed"},
        barber_shop_token
    )
    assert completed.get("status") == "completed", \
        f"Esperava status=completed, obteve: {completed.get('status')}"
    ok(f"Booking #{booking_id} concluído com sucesso ✓")
    info(f"Serviço: '{service['name']}', Preço: {completed.get('total_price')} Kz")

    # ─────────────────────────────────────────────────────────────────────────
    # PASSO 14 — Cliente verifica as suas marcações
    # ─────────────────────────────────────────────────────────────────────────
    step(14, "Cliente verifica as suas marcações (/bookings/me)")
    my_bookings = api_get("/bookings/me", client_token)
    found = next((b for b in my_bookings if b["id"] == booking_id), None)
    assert found, f"Booking #{booking_id} não encontrado nas marcações do cliente!"
    assert found["status"] == "completed", \
        f"Esperava status=completed, obteve: {found['status']}"
    ok(f"Booking #{booking_id} visível para o cliente com status='completed' ✓")

    # ─────────────────────────────────────────────────────────────────────────
    # Encerrar WebSockets
    # ─────────────────────────────────────────────────────────────────────────
    client_stop.set()
    barber_stop.set()
    client_ws_thread.join(timeout=3)
    barber_ws_thread.join(timeout=3)

    # ─────────────────────────────────────────────────────────────────────────
    # SUMÁRIO FINAL
    # ─────────────────────────────────────────────────────────────────────────
    divider()
    print(f"""
{C.BOLD}{C.GREEN}╔══════════════════════════════════════════════════════════╗
║   🎉  TODOS OS TESTES PASSARAM COM SUCESSO!               ║
╚══════════════════════════════════════════════════════════╝{C.RESET}

{C.BOLD}Resumo do fluxo testado:{C.RESET}
  ✔  Cliente autenticado: {CLIENT_EMAIL}
  ✔  Barbeiro autenticado: {BARBER_EMAIL}
  ✔  Barbeiro ficou online e seleccionou barbearia: '{shop['name']}'
  ✔  WebSocket: cliente e barbeiro ligados em tempo real
  ✔  Cliente criou BookingRequest #{request_id}
  ✔  Barbeiro recebeu notificação WS 'new_booking_request' em tempo real
  ✔  Barbeiro aceitou o pedido
  ✔  Booking #{booking_id} criado automaticamente
  ✔  Cliente recebeu notificação WS 'booking_request_accepted' em tempo real
  ✔  Barbeiro confirmou e concluiu o serviço
  ✔  Booking status final: completed

{C.GREY}Fluxo: Pedido → Dispatch → Aceitação → Confirmação → Conclusão{C.RESET}
""")


# ══════════════════════════════════════════════════════════════════════════════
#  ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"""
{C.BOLD}{C.CYAN}╔══════════════════════════════════════════════════════════╗
║  KORTA — Teste Realtime: Barbeiro vai ao Cliente         ║
║  Fluxo E2E completo com WebSockets                       ║
╚══════════════════════════════════════════════════════════╝{C.RESET}
Verificando conexão com a API em {BASE_URL}…""")

    try:
        health = requests.get("http://localhost:8000/health", timeout=5)
        if health.ok:
            ok("API online ✓")
        else:
            fail(f"API respondeu com {health.status_code}")
    except Exception as e:
        fail(f"Não foi possível conectar à API: {e}\n"
             f"  Certifique-se que ./start_all.sh está a correr.")

    try:
        run_tests()
    except SystemExit:
        raise
    except Exception as e:
        import traceback
        fail(f"Erro inesperado: {e}\n{traceback.format_exc()}")
