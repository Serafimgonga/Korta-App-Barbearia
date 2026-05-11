---
description: 📱 2. Organização do CLIENTE (Expo / React Native)
---

📱 2. Organização do CLIENTE (Expo / React Native)
🔥 Estrutura recomendada (limpa e escalável)
korta-app/
│
├── src/
│   ├── app/              # Expo Router (rotas)
│   ├── components/       # UI reutilizável
│   ├── screens/         # (se não usar app router)
│   ├── services/        # chamadas API
│   ├── hooks/           # hooks customizados
│   ├── store/           # estado global (Zustand/Redux)
│   ├── utils/           # funções auxiliares
│   ├── types/           # TypeScript types
│   ├── assets/          # imagens, logo, icons
│   ├── constants/       # cores, config, URLs
│   └── config/          # config app (API URL, etc)
│
├── App.tsx
├── package.json
└── app.json