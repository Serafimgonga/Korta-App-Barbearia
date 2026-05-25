# Workflow — Mobile (Expo + TypeScript)

Descrição
- Objetivo: documentar a arquitetura, telas e integrações do cliente Expo/React Native para que a IA compreenda o fluxo de navegação, chamadas API e pontos a mudar.

Stack e contexto
- Expo (managed) + TypeScript
- Estado: Zustand, cache: React Query
- HTTP: Axios com `apps/mobile/src/api/client.ts` (NGROK_URL / tunnel)
- Tema e tokens: `apps/mobile/src/theme/index.ts`

Arquivos-chave
- [apps/mobile/src/api/client.ts](apps/mobile/src/api/client.ts)
- [apps/mobile/src/theme/index.ts](apps/mobile/src/theme/index.ts)
- [apps/mobile/app/(auth)/login.tsx](apps/mobile/app/(auth)/login.tsx)
- [apps/mobile/app/booking/create.tsx](apps/mobile/app/booking/create.tsx)
- [apps/mobile/app/(barber)/dashboard.tsx](apps/mobile/app/(barber)/dashboard.tsx)
- [apps/mobile/src/services](apps/mobile/src/services)
- [apps/mobile/src/store](apps/mobile/src/store)

Principais telas (mapa rápido)
- Onboarding / Login (OTP)
- Home: botão principal “Pedir corte agora”, lista de barbeiros online
- Escolha de serviço
- Tela `Searching` (pendente / a criar) — UX de espera e timeout
- Booking flow: aceitar, tracking, finalizar, avaliar
- Dashboard barbeiro: online/offline toggle, aceitar pedidos

Como executar localmente
```bash
cd apps/mobile
npm install
# definir NGROK_URL em src/api/client.ts (ou usar tunnel.py)
npx expo start --tunnel
```

Critérios de aceitação (mobile)
- App consegue autenticar com o backend (JWT) e persistir token.
- Listar barbeiros próximos usando o endpoint `barbershops`.
- Criar pedido via `bookings/request` e mostrar estado `A procurar barbeiro…`.
- Tela `Searching` exibe timeout, opção cancelar e expandir raio.

Notas para a IA / desenvolvedor
- Ao propor alterações UI, indique: arquivos a editar, componentes a criar, hooks necessários e mudanças no `client.ts`.
- Para testes rápidos, use `tunnel.py` para gerar URL pública e atualizar `NGROK_URL`.
