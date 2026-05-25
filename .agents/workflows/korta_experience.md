---
description: Workflow UX — Experiência na App KORTA: onboarding, pedido, Uber-style, barbeiro, pagamento e avaliação.
---

# KORTA — Workflow: Experiência na App (UX Flow)

Objetivo: descrever a experiência do utilizador end-to-end — desde o primeiro acesso até à avaliação — e indicar requisitos mínimos e próximos passos para transformar o fluxo em funcionalidades reais.

---

## 🚀 1. PRIMEIRA EXPERIÊNCIA (ONBOARDING)

Quando alguém abre a KORTA pela primeira vez, a sequência deve ser curta, clara e orientar para a ação.

- **Tela 1 — Bem-vindo**
  - Título: “Encontra um barbeiro perto de ti em minutos”
  - Visual: logo + ilustração minimalista
  - CTA: `Começar` (leva para escolha do perfil)

- **Tela 2 — Escolha do perfil**
  - Botões: `👤 Quero cortar cabelo` / `💇‍♂️ Sou barbeiro`
  - Escolha define fluxo inicial (cliente vs barbeiro)

- **Tela 3 — Permissão de localização (crucial)**
  - Microcopy: “Precisamos da tua localização para encontrar barbeiros próximos.”
  - CTA: `Permitir localização` / `Lembrar depois`
  - Fallback: permitir inserir cidade manualmente

Notas UX: tornar a permissão clara e explicar benefícios (rapidez + proximidade).

---

## 🏠 2. HOME DA APP (CLIENTE)

Prioridade: foco na ação principal — `Pedir corte agora`.

- Layout principal:
  - CTA central grande: **Pedir corte agora** (prominente, cor Gold)
  - Mapa / localização reduzida na topbar (pill) mostrando cidade/estado
  - Lista de cards: barbeiros perto (thumbnail, nome, ⭐ avaliação, 📍 distância, 💰 preço, ⏱ tempo estimado)
  - Atalhos rápidos: `Corte` / `Barba` / `Combo` (botões rápidos sob o CTA)

Micro-interações: hover/tap rápido nos cards, carregamento suave, placeholders animados.

---

## ✂️ 3. EXPERIÊNCIA DE PEDIDO (CORE)

Fluxo quando cliente toca em `Pedir corte agora`:

1. **Escolher serviço** — interface por botões (Corte normal, Degradê, Barba, Combo)
2. **Escolher modo** — `Vem até mim (Domicílio)` ou `Vou ao barbeiro (Salão)`
3. **Mapa simples** — mostra posição do cliente + barbeiros disponíveis ao redor (pins)
4. **Lista de barbeiros** — cada cartão com foto, nome, ⭐ avaliação, 📍 distância, 💰 preço, ⏱ tempo estimado, botão `Selecionar`
5. **Confirmar pedido** — resumo (serviço, barbeiro escolhido, preço final) + `Confirmar pedido`

Observação: UX deve permitir “Selecionar barbeiro” OU “Automático” (o sistema escolhe por proximidade/ranking).

---

## 🔥 4. EXPERIÊNCIA “UBER STYLE” (MÁGICA DA APP)

Após confirmar:

- **Tela de espera (searching)** — mensagem: `A procurar barbeiro para ti...` + animação de procura
- **Timeout/Retry** — mostrar estado se nenhum barbeiro aceitar em X segundos (ex: 20–30s): `Aumentar raio` / `Tentar novamente` / `Cancelar`

Quando um barbeiro aceita:
- Mostrar: `Barbeiro encontrado!` + foto, nome, ⭐ rating, distância
- Status em tempo real: 🚶‍♂️ a caminho → 📍 chegou → ✂️ em serviço → ✅ concluído

UX crucial: o ecrã de espera deve reduzir ansiedade — animação, estimativas e botão cancelar.

---

## 🧑‍🔧 5. EXPERIÊNCIA DO BARBEIRO

- **Home do barbeiro:** botão grande `ONLINE / OFFLINE`
- Quando `ONLINE`:
  - Recebe push / notificação in-app: `Novo pedido perto de ti` com tipo de corte, distância e preço
  - Actions: `Aceitar` / `Recusar`
- Ao aceitar:
  - Mostrar mapa com rota até o cliente
  - Botões: `Iniciar serviço` (quando chegar), `Finalizar serviço` (quando terminar)
- Registo de ganhos e histórico (simples) disponível no perfil do barbeiro

---

## 💰 6. EXPERIÊNCIA DE PAGAMENTO

Fluxo pós-serviço:
- Mostrar tela: `Serviço concluído` → opções: `Dinheiro` / `Mobile Money` / (futuro) `Carteira Korta`
- Confirmar pagamento e gerar comprovativo

Nota local: priorizar `Mobile Money` como método principal para Angola.

---

## ⭐ 7. EXPERIÊNCIA DE AVALIAÇÃO

Após pagamento/conclusão:
- Tela simples com 5 estrelas e campo de comentário opcional
- CTA: `Enviar avaliação`
- Atualizar rating e ranking localmente (sincronizar ao backend)

---

## 🔥 8. O QUE FAZ A KORTA SER DIFERENTE

Foco em três pilares:
- **Rapidez** — pedir em < 1 minuto
- **Proximidade** — barbeiros próximos em tempo real
- **Confiança** — avaliações, histórico e ranking local

Copy exemplos:
- Hero: `Pedir corte em minutos. Barbeiros perto de ti.`
- CTA: `Pedir corte agora — está perto de ti`

---

## 🧩 9. COMO A APP DEVE SE SENTIR

Tone: simples como WhatsApp, rápida como Uber, visual como Instagram.

Design tokens: usar paleta atual (preto profundo, dourado, cinzas). Ver: [apps/mobile/src/theme/index.ts](apps/mobile/src/theme/index.ts#L1-L150)

Micro-interações: loaders curtos, animações de procura, transições suaves entre estados.

---

## 📱 10. RESUMO DO FLOW (conciso)

Cliente abre app → Escolhe `Pedir corte` → Escolhe serviço → Modo (casa/salão) → Seleciona barbeiro ou automático → Sistema encontra barbeiro → Barbeiro aceita → Vai até cliente → Faz corte → Pagamento → Avaliação

---

## 🧭 IMPLEMENTAÇÃO - NOTAS TÉCNICAS RÁPIDAS (MVP)

Prioridade mínima para reproduzir a experiência `Uber Style` em MVP:

1. **Endpoint** `POST /api/v1/bookings/request`
   - Payload: `{ lat, lng, service_id, date?, time_slot?, mode }`
   - Ação: cria um `request` (não exige `barbershop_id`) e inicia distribuição automática

2. **Distribuição (server)**
   - Procurar barbeiros online e próximos (ex: 5–10 km) que ofereçam o serviço
   - Enviar notificação / push / WebSocket ou adicionar a pool para polling
   - Se barbeiro aceitar → criar `booking` definitivo para esse `barbershop_id`

3. **Presença**
   - Implementar toggle `barber.is_online` ou `barbershop.is_accepting_requests`
   - Mobile: botão claro `ONLINE / OFFLINE`

4. **Notificações**
   - MVP rápido: polling curto no cliente/barbeiro (ex: cada 5–10s)
   - Ideal: FCM + WS `/ws/notifications` para real-time

5. **Modelos DB**
   - Criar tabela `booking_requests` (id, user_id, lat, lng, service_id, mode, status(searching/assigned/timeout), created_at)
   - Quando assigned → criar `bookings` existente

6. **Mobile**
   - Tela `Searching` com estado `searching` e `cancel`
   - Tela `Barber found` com dados do barbeiro + live status

7. **Fallbacks**
   - Timeout → expandir raio e tentar novamente
   - Se nenhum barbeiro disponível → permitir reservar para horário futuro

---

## ✅ CRITÉRIOS DE ACEITAÇÃO (MVP)

- Cliente consegue pedir sem escolher barbearia; a app tenta encontrar barbeiro automaticamente
- Barbeiro online vê pedido (via polling ou push) e consegue aceitar/rejeitar
- Ao aceitar, é criado um `booking` real e ambos os lados veem status atualizados
- Tela de espera amigável com timeout e opção de cancelar

---

## ✳️ PRÓXIMOS PASSOS (recomendado)

1. Criar wireframes das telas principais (Onboarding, Home, Pedido, Searching, Barber accept)
2. Implementar `booking_requests` e endpoint `POST /bookings/request` (backend)
3. Adicionar toggle online/offline no flow do barbeiro (mobile + backend)
4. Implementar polling simples (mobile) para aceitar pedidos (rápido para demo)
5. Substituir polling por WebSocket/FCM (produção)

---

Arquivo criado: this workflow deve viver em `.agents/workflows/korta_experience.md` e ser referenciado em documentação e planner.

Se quiser, prossigo com:
- (A) Wireframes / UI completo para cada tela
- (B) Implementação backend do `POST /bookings/request` + DB schema
- (C) Ajustes mobile (searching screen + polling) para demo

Indique A, B ou C (ou combinação) e eu começo a implementar.
