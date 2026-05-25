🚀 KORTA — ARQUITETURA V2 (BARBEARIA ON-DEMAND)
description: >
  És um engenheiro sénior full-stack especializado em aplicações mobile e APIs REST.

  Estás a construir a KORTA — uma plataforma mobile de serviços de barbearia on-demand em tempo real,
  focada inicialmente na província de Ícolo e Bengo, Angola, com objetivo de expansão nacional.

  O produto conecta clientes a barbeiros disponíveis próximos, permitindo pedidos imediatos ou agendados,
  com sistema de matchmaking, geolocalização e aceitação de pedidos em tempo real.
🧠 VISÃO DO PRODUTO (ATUALIZADA)

A KORTA deixa de ser apenas uma app de marcação.

Agora é:

💈 Uma rede de barbeiros on-demand em tempo real (tipo Uber, mas para cortes)

PROBLEMA QUE RESOLVE
Clientes não sabem quem está disponível agora
Não existe preço transparente
Marcação é feita manualmente (WhatsApp / chamadas)
Tempo de espera é imprevisível
SOLUÇÃO KORTA V2
barbeiros ficam ONLINE/OFFLINE
clientes fazem pedido em tempo real
sistema encontra melhor barbeiro disponível
serviço acontece no local do cliente ou salão
tudo rastreado e avaliado
⚙️ CORE DO SISTEMA (NOVA LÓGICA)
💡 MODELO PRINCIPAL

“Request → Match → Accept → Execute → Complete → Rate”

🔄 FLUXO GLOBAL DO SISTEMA
CLIENTE cria pedido
        ↓
SISTEMA encontra barbeiros disponíveis
        ↓
ENVIAR pedido em tempo real
        ↓
BARBEIRO aceita
        ↓
EXECUÇÃO do serviço
        ↓
FINALIZAÇÃO
        ↓
AVALIAÇÃO + pagamento
👥 TIPOS DE USUÁRIOS (V2)
👤 Cliente
pede corte instantâneo
escolhe tipo de serviço
escolhe casa ou salão
acompanha barbeiro em tempo real
avalia serviço
💇‍♂️ Barbeiro (PROVIDER)
fica online/offline
recebe pedidos em tempo real
aceita ou rejeita pedidos
vai até cliente ou recebe cliente
ganha histórico e ranking
🧠 Sistema (CORE INTELIGENTE)
matchmaking automático
cálculo de distância (Haversine)
fila de oferta (broadcast inteligente)
gestão de estado em tempo real
ranking e reputação
📱 FLUXO DO CLIENTE (V2 ON-DEMAND)
1. Login
telefone (principal)
OTP SMS
2. Home (nova UX)
Elementos principais:
🔘 “Pedir corte agora” (CTA principal)
🔥 barbeiros online próximos
⭐ top barbeiros da zona
💈 serviços rápidos
3. Escolha de serviço
Corte normal
Degradê
Barba
Combo
4. Tipo de atendimento
🏠 DOMICÍLIO

Barbeiro vai até cliente

💈 SALÃO

Cliente vai até barbeiro

5. Matchmaking (NOVA LÓGICA)

Sistema procura:

barbeiros ONLINE
dentro de raio (5–10 km)
que fazem esse serviço
ordena por:
distância
rating
tempo de resposta
6. Lista de barbeiros (fallback manual)

Se cliente quiser escolher:

nome
foto
rating
distância
preço
botão “pedir”
7. Pedido enviado

👉 Estado: “A procurar barbeiro…”

8. Aceitação
barbeiros recebem pedido
primeiro a aceitar (ou melhor ranking) ganha
9. Tracking em tempo real

Estados:

🟡 A caminho
📍 Chegou
✂️ Em serviço
✅ Concluído
10. Pagamento
dinheiro
mobile money (principal em Angola)
carteira KORTA (futuro)
11. Avaliação
estrelas
comentário
reputação do barbeiro atualizada
💇‍♂️ FLUXO DO BARBEIRO (V2)
1. Registo profissional
dados pessoais
foto
localização base
tipo de serviços
2. Gestão de serviços
corte
barba
combos
preços dinâmicos
3. Estado ONLINE/OFFLINE
🟢 ONLINE → recebe pedidos
🔴 OFFLINE → não recebe nada
4. Receber pedido

Push notification:

tipo de serviço
distância
valor estimado
botão aceitar/rejeitar
5. Aceitar pedido
bloqueia outros barbeiros
inicia tracking
6. Navegação
mapa com rota até cliente
7. Execução
iniciar serviço
finalizar serviço
8. Ganhos
histórico
saldo
performance
🧠 SISTEMA INTELIGENTE (MOTOR KORTA)
📡 MATCHMAKING ENGINE
Input:
localização cliente
tipo de serviço
raio
Processamento:
filtrar barbeiros ONLINE
filtrar por serviço
calcular distância
ordenar ranking
Output:
lista ordenada de barbeiros
📤 DISPATCH SYSTEM

Dois modos:

1. BROADCAST

Todos recebem pedido

2. INTELIGENTE (RECOMENDADO)
envia primeiro ao melhor barbeiro
fallback automático
⏱️ STATE MACHINE (IMPORTANTE)
REQUESTED
→ MATCHING
→ ACCEPTED
→ ON_THE_WAY
→ ARRIVED
→ IN_SERVICE
→ COMPLETED
→ RATED
🗺️ GEOLOCALIZAÇÃO
GPS cliente ativo
GPS barbeiro ativo
cálculo de distância em tempo real
rota com Google Maps API
🔔 NOTIFICAÇÕES (REAL TIME)
Cliente:
pedido aceito
barbeiro a caminho
chegou
Barbeiro:
novo pedido
cliente ativo perto
alerta de alta procura
💰 MONETIZAÇÃO (V2)
Modelo principal:
comissão por serviço (10–15%)
Futuro:
taxa de prioridade (boost para barbeiros)
assinatura PRO para barbeiros
taxa de deslocação
📊 REPUTAÇÃO E RANKING

Sistema baseado em:

estrelas
tempo de resposta
taxa de aceitação
proximidade
⚙️ MVP (VERSÃO 2 REALISTA)
ESSENCIAL:
CLIENTE:
login
pedir corte
ver barbeiros online
tracking básico
avaliação
BARBEIRO:
online/offline
receber pedidos
aceitar
concluir serviço
SISTEMA:
matchmaking simples
notificação push
estados básicos
🔥 DIFERENCIAL DA KORTA V2

Não é uma app de barbearia.

É um marketplace em tempo real de serviços de corte.

🚀 EVOLUÇÃO FUTURA (IMPORTANTE)

Depois da V2 validada:

estética feminina
manicure
maquiagem
massagens
super-app de beleza
📌 PRÓXIMO PASSO (RECOMENDADO)

Agora podemos transformar isto em código real.

Posso ajudar-te a criar:

1. 🧱 Banco de dados completo (PostgreSQL + relações)
2. ⚙️ Backend FastAPI (matching engine real)
3. 📱 App Expo (primeira versão funcional)
4. 🔔 Sistema de notificações em tempo real (WebSocket + FCM)
5. 🧠 algoritmo de matching (o coração da KORTA)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADENDO: RESUMO EXECUTIVO, DEMO E PRÓXIMOS PASSOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resumo executivo:
- Objetivo: construir um marketplace on‑demand para serviços de barbearia, priorizando rapidez, proximidade e confiança.
- MVP mínimo (V2 realista): permitir ao cliente pedir sem escolher barbearia; barbeiro online accepta; tracking básico; avaliações.
- UX detalhada e microflow estão em: `.agents/workflows/korta_experience.md` (design e critérios UX).

DEMO RÁPIDO (LOCAL) — passos para um recrutador testar a app em poucas etapas:

1) Subir Postgres (docker):

```bash
cd apps/api
docker-compose up -d db
```

2) Criar ambiente e instalar dependências, popular dados de demo:

```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_rich.py
```

3) Iniciar API (localhost) ou usar túnel para dispositivo físico:

```bash
# iniciar só o uvicorn
./venv/bin/python -m uvicorn app.main:app --reload --port 8000

# ou iniciar túnel (gera URL pública para o mobile)
./venv/bin/python tunnel.py
```

4) Mobile (Expo):

```bash
cd apps/mobile
npm install
# Definir NGROK_URL em apps/mobile/src/api/client.ts com a URL do tunnel
npx expo start --tunnel
```

CRITÉRIOS DE ACEITAÇÃO (V2 MVP)
- Cliente pode pedir corte sem escolher barbearia explicitamente (endpoint `POST /api/v1/bookings/request` ou fluxo equivalente).
- Barbeiro online recebe pedido (polling simples ou push) e pode aceitar/rejeitar.
- Ao aceitar, é criado um `booking` e ambos (cliente/barbeiro) vêem estados: `a caminho`, `chegou`, `em serviço`, `concluído`.
- Tela de espera (searching) com timeout e opções (cancelar / expandir raio) disponível.

PRIORIDADES TÉCNICAS (próximos sprints)
1. Criar modelo `booking_requests` e endpoint `POST /api/v1/bookings/request` (server-side dispatch).
2. Toggle `barber.is_online` / `barbershop.is_accepting_requests` e UI para o barbeiro (`ONLINE` / `OFFLINE`).
3. Distribuição inicial via polling (rápido para demo), posteriormente FCM + WebSocket para real‑time.
4. Implementar tela `Searching` no mobile e fluxo de `Barber found` com atualização de status.
5. Melhorar observability: logs, métricas (aceitação, tempo de resposta) e testes end-to-end.

REFERÊNCIAS RÁPIDAS
- UX workflow detalhado: `.agents/workflows/korta_experience.md`
- Seed de dados (demo): `apps/api/seed_rich.py`
- Endpoints principais: ver secção `ENDPOINTS API (v1) — ESTRUTURA MÍNIMA` neste ficheiro

---

Se quiser, implemento já o item (1) ou (4) acima (endpoint `bookings/request` no backend ou a tela `Searching` no mobile) — diga qual prefere e eu começo a codar.
