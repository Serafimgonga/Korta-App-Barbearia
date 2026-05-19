# ✂️ KORTA

A **KORTA** é uma aplicação mobile de descoberta e marcação de barbearias, focada inicialmente na província de Ícolo e Bengo, Angola. 

A plataforma liga clientes que procuram cortes de qualidade a barbeiros profissionais, oferecendo uma experiência fluida de agendamento e um painel de gestão completo (PRO) para os donos das barbearias.

---

## 🚀 Funcionalidades

### 👤 Para Clientes
- **Descoberta:** Encontra barbearias perto de ti com base na localização (GPS).
- **Filtros e Categorias:** Explora por "Premium", "Mais Votados", "Perto de Ti" ou pesquisa por nome.
- **Marcação:** Agenda cortes e serviços de forma rápida.
- **Reviews:** Avalia e vê o feedback de outros utilizadores.
- **Design Premium:** Interface moderna com animações e foco na usabilidade.

### 💈 Para Barbeiros (Painel PRO)
- **Dashboard:** Visão geral com métricas de avaliações e total de barbearias.
- **Minha Loja:** Gestão de múltiplas barbearias (nome, morada, horário, estado aberto/fechado).
- **Serviços:** CRUD completo para adicionar, editar, desativar ou remover serviços e preços.
- **Agendamentos:** Gestão de marcações (Pendente, Confirmado, Concluído, Recusado).

---

## 🛠️ Tecnologias

O projeto é um monorepo (`apps/`) dividido em duas partes principais:

### Mobile (`apps/mobile`)
- **Framework:** React Native com [Expo](https://expo.dev/) (SDK 54)
- **Navegação:** Expo Router (File-based routing)
- **Estado/Fetching:** Zustand & React Query (@tanstack/react-query)
- **Estilização:** Sistema de Design próprio (`src/theme`) com ícones Lucide
- **Animações:** Animated API nativa do React Native

### API REST (`apps/api`)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Base de Dados:** PostgreSQL
- **ORM & Migrações:** SQLAlchemy + Alembic
- **Autenticação:** JWT (JSON Web Tokens) com role-based access (`client` vs `barber`)

---

## ⚙️ Como Executar Localmente

### 1. Backend (API)

```bash
cd apps/api

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edita o .env com a tua string de conexão PostgreSQL

# Correr migrações e popular a base de dados com dados de teste
alembic upgrade head
python seed_rich.py

# Iniciar o servidor de desenvolvimento
uvicorn app.main:app --reload
```

### 2. Túnel Local (Apenas necessário se estiveres numa VM ou rede restrita)

Para permitir que o Expo Go no telemóvel consiga chegar à API na tua máquina:

```bash
cd apps/api
python tunnel.py
```
*Isto irá gerar um link (ex: `https://xxxx.loca.lt`). Copia este link.*

### 3. Mobile App

```bash
cd apps/mobile

# Instalar dependências
npm install

# Configurar o endpoint da API
# Abre apps/mobile/src/api/client.ts e substitui a baseURL pelo link gerado no passo 2.

# Iniciar o Expo
npx expo start --tunnel --clear
```

Lê o QR Code com a app Expo Go no teu smartphone.

---

## 🔑 Credenciais de Teste

Após correres o script `seed_rich.py`, podes usar as seguintes contas para testar a app:

**Conta de Barbeiro (Acesso ao Painel PRO):**
- Email: `serafim@korta.ao`
- Password: `korta123`

**Conta de Cliente:**
- Email: `abel@gmail.com`
- Password: `korta123`

---

## 📄 Estrutura do Projeto

```text
KORTA/
├── apps/
│   ├── api/                  # Backend FastAPI
│   │   ├── app/              # Código fonte da API
│   │   ├── alembic/          # Migrações da BD
│   │   ├── seed_rich.py      # Script de povoamento
│   │   └── tunnel.py         # Script para expor a API localmente
│   └── mobile/               # App React Native/Expo
│       ├── app/              # Rotas (Expo Router)
│       │   ├── (auth)/       # Ecrãs de Login e Registo
│       │   ├── (tabs)/       # Área do Cliente
│       │   └── (barber)/     # Área PRO do Barbeiro
│       └── src/              # Componentes, Serviços, Theme, etc.
└── README.md
```

Feito com 💛 para o mercado de Ícolo e Bengo.
