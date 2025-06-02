# Configuração para implantação do front-end React

Este arquivo contém as configurações necessárias para compilar e implantar o front-end React em ambiente de produção.

## Configuração do ambiente de produção

```bash
# Arquivo .env.production
REACT_APP_API_URL=https://comunidade.aneti.org.br/api
```

## Configuração do Nginx para servir o front-end

```nginx
server {
    listen 80;
    server_name comunidade.aneti.org.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name comunidade.aneti.org.br;
    
    # Configuração SSL
    ssl_certificate /etc/letsencrypt/live/comunidade.aneti.org.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/comunidade.aneti.org.br/privkey.pem;
    
    # Configurações de segurança recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # Configurações para o front-end React
    root /var/www/comunidade.aneti.org.br;
    index index.html;
    
    # Configuração para o React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Configuração para a API (proxy reverso para o back-end)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Configurações de cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

## Instruções para implantação

1. Compilar o front-end para produção:
```bash
cd /home/ubuntu/associacao-web
pnpm build
```

2. Transferir os arquivos compilados para o servidor:
```bash
# Criar diretório no servidor
ssh user@servidor "mkdir -p /var/www/comunidade.aneti.org.br"

# Transferir arquivos compilados
scp -r build/* user@servidor:/var/www/comunidade.aneti.org.br/
```

3. Configurar o Nginx no servidor:
```bash
# Criar arquivo de configuração
nano /etc/nginx/sites-available/comunidade.aneti.org.br

# Criar link simbólico
ln -s /etc/nginx/sites-available/comunidade.aneti.org.br /etc/nginx/sites-enabled/

# Verificar configuração
nginx -t

# Reiniciar Nginx
systemctl reload nginx
```

4. Configurar SSL com Certbot:
```bash
certbot --nginx -d comunidade.aneti.org.br
```

5. Verificar a implantação acessando https://comunidade.aneti.org.br
