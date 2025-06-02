# Documentação de Implantação - ANETI MVP

Este documento contém as instruções detalhadas para implantação e configuração do MVP da ANETI, incluindo as versões web e mobile.

## Estrutura do Projeto

O projeto está dividido em três partes principais:

1. **Backend** - API REST em Node.js
2. **Frontend Web** - Aplicação React com TypeScript
3. **Frontend Mobile** - Aplicação React Native para Android e iOS

## Requisitos de Sistema

### Backend
- Node.js 16.x ou superior
- PostgreSQL 14.x ou superior
- Servidor Linux (recomendado Ubuntu 20.04 LTS ou superior)
- Nginx (para proxy reverso)
- Certificado SSL (recomendado Let's Encrypt)

### Frontend Web
- Node.js 16.x ou superior (para build)
- Servidor web (Nginx recomendado)

### Frontend Mobile
- React Native CLI
- Android Studio (para build Android)
- Xcode (para build iOS, requer macOS)
- JDK 11
- Cocoapods (para iOS)

## Configuração do Backend

### 1. Configuração do Banco de Dados

```bash
# Criar banco de dados PostgreSQL
psql -U postgres
CREATE DATABASE aneti_db;
CREATE USER aneti_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE aneti_db TO aneti_user;
\q

# Executar script de migração
cd /caminho/para/backend
psql -U aneti_user -d aneti_db -f src/migrations/create_tables.sql
```

### 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório backend com as seguintes variáveis:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aneti_db
DB_USER=aneti_user
DB_PASSWORD=sua_senha_segura

# Configurações JWT
JWT_SECRET=seu_token_jwt_secreto_muito_seguro
JWT_EXPIRATION=24h

# Configurações de Email
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu_email@seu-provedor.com
SMTP_PASS=sua_senha_email
EMAIL_FROM=noreply@aneti.org.br

# Configurações do Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-0000000000000000000000000000000000-000000000
MERCADOPAGO_PUBLIC_KEY=TEST-00000000-0000-0000-0000-000000000000

# URLs da Aplicação
BACKEND_URL=https://api.aneti.org.br
FRONTEND_URL=https://aneti.org.br

# Configurações de Upload
UPLOAD_DIR=/var/www/aneti/uploads
MAX_FILE_SIZE=10485760  # 10MB em bytes
```

### 3. Instalação de Dependências e Build

```bash
cd /caminho/para/backend
npm install --production
npm run build
```

### 4. Configuração do Serviço Systemd

Crie um arquivo de serviço para gerenciar o processo do backend:

```bash
sudo nano /etc/systemd/system/aneti-backend.service
```

Adicione o seguinte conteúdo:

```
[Unit]
Description=ANETI Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/caminho/para/backend
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ative e inicie o serviço:

```bash
sudo systemctl enable aneti-backend
sudo systemctl start aneti-backend
```

### 5. Configuração do Nginx como Proxy Reverso

```bash
sudo nano /etc/nginx/sites-available/aneti-backend
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name api.aneti.org.br;
    
    # Redirecionar HTTP para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.aneti.org.br;
    
    ssl_certificate /etc/letsencrypt/live/api.aneti.org.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aneti.org.br/privkey.pem;
    
    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # Configurações de proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Configuração para uploads
    client_max_body_size 10M;
    
    # Configuração para arquivos estáticos (uploads)
    location /uploads/ {
        alias /var/www/aneti/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/aneti-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configuração do Frontend Web

### 1. Configuração de Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do diretório frontend web:

```
REACT_APP_API_URL=https://api.aneti.org.br
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-00000000-0000-0000-0000-000000000000
```

### 2. Build da Aplicação

```bash
cd /caminho/para/frontend-web
npm install
npm run build
```

### 3. Configuração do Nginx para o Frontend Web

```bash
sudo nano /etc/nginx/sites-available/aneti-frontend
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name aneti.org.br www.aneti.org.br;
    
    # Redirecionar HTTP para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name aneti.org.br www.aneti.org.br;
    
    ssl_certificate /etc/letsencrypt/live/aneti.org.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aneti.org.br/privkey.pem;
    
    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    root /var/www/aneti/frontend;
    index index.html;
    
    # Configuração para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Configurações de cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/aneti-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Implantação dos Arquivos

```bash
sudo mkdir -p /var/www/aneti/frontend
sudo cp -r /caminho/para/frontend-web/build/* /var/www/aneti/frontend/
sudo chown -R www-data:www-data /var/www/aneti/frontend
```

## Configuração do Frontend Mobile

### 1. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório frontend mobile:

```
API_URL=https://api.aneti.org.br
MERCADOPAGO_PUBLIC_KEY=TEST-00000000-0000-0000-0000-000000000000
```

### 2. Build para Android

```bash
cd /caminho/para/frontend-mobile
npm install

# Gerar APK de debug
npx react-native run-android --variant=release

# Gerar APK assinado para produção
cd android
./gradlew assembleRelease
```

O APK assinado estará disponível em: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Build para iOS (requer macOS)

```bash
cd /caminho/para/frontend-mobile
npm install
cd ios
pod install
cd ..

# Abrir o projeto no Xcode
npx react-native run-ios --configuration Release
```

No Xcode, selecione Product > Archive para gerar o arquivo IPA para distribuição.

## Configuração do Mercado Pago

1. Crie uma conta no [Mercado Pago Developers](https://developers.mercadopago.com/)
2. Obtenha suas credenciais de teste (Public Key e Access Token)
3. Configure os webhooks para notificações de pagamento:
   - URL: `https://api.aneti.org.br/api/payments/webhook/mercadopago`
   - Eventos: `payment.created`, `payment.updated`

## Manutenção e Monitoramento

### Logs do Backend

```bash
sudo journalctl -u aneti-backend -f
```

### Backup do Banco de Dados

```bash
# Script de backup diário
pg_dump -U aneti_user aneti_db > /backup/aneti_db_$(date +%Y%m%d).sql
```

### Monitoramento de Saúde da API

Configure um endpoint de health check:
`GET https://api.aneti.org.br/health`

## Solução de Problemas Comuns

### Erro de Conexão com o Banco de Dados
- Verifique se o PostgreSQL está em execução: `sudo systemctl status postgresql`
- Verifique as credenciais no arquivo `.env`
- Verifique as permissões do usuário do banco de dados

### Erro 502 Bad Gateway
- Verifique se o serviço backend está em execução: `sudo systemctl status aneti-backend`
- Verifique os logs do backend: `sudo journalctl -u aneti-backend -f`
- Verifique a configuração do Nginx: `sudo nginx -t`

### Problemas com Upload de Arquivos
- Verifique as permissões do diretório de uploads: `sudo chown -R www-data:www-data /var/www/aneti/uploads`
- Verifique o limite de tamanho de arquivo no Nginx e na configuração do backend

## Contato para Suporte

Para suporte técnico, entre em contato:
- Email: suporte@aneti.org.br
- Telefone: (XX) XXXX-XXXX
