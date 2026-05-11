---
description: 📱 KORTA —  1. Visão da Ideia  A KORTA é uma aplicação mobile de descoberta e marcação de barbearias, focada inicialmente na província de Ícolo e Bengo.  A app permite aos utilizadores:  Encontrar barbearias próximas 
---

📱 KORTA — Product Brief & Technical Plan
🧠 1. Visão da Ideia

A KORTA é uma aplicação mobile de descoberta e marcação de barbearias, focada inicialmente na província de Ícolo e Bengo.

A app permite aos utilizadores:

Encontrar barbearias próximas em mapa
Ver preços de cortes e serviços
Ver estilos de cortes disponíveis
Ver se a barbearia está aberta ou fechada
Fazer marcações online
Avaliar barbearias
Comparar preços e qualidade

👉 Objetivo principal:

Simplificar o processo de encontrar, comparar e marcar um corte de cabelo de forma rápida e moderna.

🎯 2. Problema que resolve

Atualmente, os utilizadores enfrentam:

Falta de informação sobre preços
Dificuldade em encontrar barbearias próximas
Tempo perdido à procura de disponibilidade
Falta de transparência na qualidade
Marcação feita apenas por contacto direto (WhatsApp/telefone)
💡 3. Solução

A KORTA centraliza tudo num único sistema:

📍 Descoberta de barbearias
💰 Comparação de preços
📸 Visualização de cortes reais
🟢 Status de abertura em tempo real
📅 Marcação digital
⭐ Sistema de avaliações
👤 4. Utilizadores-alvo
Jovens (15–40 anos)
Clientes de barbearias urbanas
Profissionais ocupados
Pessoas que valorizam estilo e conveniência
💰 5. Modelo de negócio (monetização)
🔥 1. Comissão por marcação
Pequena taxa por cada agendamento concluído
🔥 2. Plano Premium para barbearias
Destaque na app
Mais visibilidade
Estatísticas de clientes
Gestão avançada
🔥 3. Publicidade local
Barbearias pagam para aparecer em destaque
🔥 4. Expansão futura
Produtos de cabelo
Serviços ao domicílio
Marketplace de beleza
🏗️ 6. Arquitetura técnica
📱 Mobile App

Usar:

Expo
TypeScript
React Native
Expo Router
⚙️ Backend API

Usar:

FastAPI
JWT Authentication
REST API
Swagger/OpenAPI
🗄️ Base de dados
PostgreSQL
☁️ Storage
Cloudinary (imagens)
Firebase Storage (opcional)
🗺️ Mapas
Google Maps API
🔔 Notificações
Firebase Cloud Messaging
📱 7. Funcionalidades do MVP
👤 Cliente
Login / registo
Lista de barbearias
Mapa de localização
Visualização de preços
Fotos de cortes
Marcação de horários
Avaliações
💈 Barbearia
Criar perfil
Adicionar serviços
Definir preços
Upload de fotos
Gerir horários
Aceitar marcações
🎨 8. Identidade visual
Nome da marca:
KORTA
Estilo:
Urban Premium Tech
Minimalista
Moderno
Masculino
Tecnológico
Cores:
Preto: #0D0D0D
Dourado: #D4AF37
Branco: #FFFFFF
Cinza: #1C1C1C
Tipografia:
Poppins
Inter
Sora
Conceito de logo:
Letra “K”
Elementos de barbearia (navalha / máquina)
Ícone de localização
Design minimalista
📲 9. Estrutura da aplicação (Expo)
Korta App
│
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── home/
│   ├── barber/
│   ├── booking/
│   └── profile/
│
├── components/
├── services/
├── store/
├── hooks/
├── utils/
└── assets/
🧠 10. Arquitetura de comunicação
Mobile (Expo)
    ↓
API (FastAPI)
    ↓
PostgreSQL
🚀 11. Estratégia de desenvolvimento
Fase 1 — MVP (Ícolo e Bengo)
Listagem de barbearias
Mapa
Preços
Marcação simples
Fase 2 — Expansão
Avaliações
Sistema de fila
Notificações
Melhor UI
Fase 3 — Monetização
Premium para barbearias
Ads
Comissão por agendamento
Fase 4 — Escala nacional
Luanda
Outras províncias
Marketplace de beleza
⚠️ 12. Regras de produto
Simplicidade primeiro
UX acima de features
Mobile-first
Foco em velocidade
Dados reais das barbearias
🔥 13. Objetivo final

Criar a maior plataforma de:

descoberta, comparação e marcação de barbearias em Angola

começando por Ícolo e Bengo e expandindo para todo o país.

🧭 14. Stack resumido
Camada	Tecnologia
Mobile	Expo
Backend	FastAPI
DB	PostgreSQL
Maps	Google Maps
Storage	Cloudinary
Auth	JWT