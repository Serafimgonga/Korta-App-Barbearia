FROM python:3.13-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para o psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir pydantic-settings email-validator python-jose[cryptography] passlib[bcrypt]

# Copiar o código da aplicação
COPY . .

# Expor a porta que o FastAPI usa
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
