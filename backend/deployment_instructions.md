# Instruções para Implantação na Hetzner

Este documento contém as instruções para implantar o back-end Node.js containerizado na Hetzner.

## Pré-requisitos

1. Servidor Hetzner configurado com Docker e Docker Compose
2. Acesso SSH ao servidor
3. Domínio `comunidade.aneti.org.br` configurado para apontar para o IP do servidor

## Passos para Implantação

### 1. Preparação do Servidor

```bash
# Atualizar o sistema
apt-get update && apt-get upgrade -y

# Instalar Docker (caso ainda não esteja instalado)
apt-get install -y docker.io docker-compose

# Iniciar e habilitar o Docker
systemctl start docker
systemctl enable docker
```

### 2. Configuração do Banco de Dados

Antes de iniciar os containers, certifique-se de que as variáveis de ambiente estão configuradas corretamente no arquivo `.env.production`. Substitua as senhas por valores seguros.

### 3. Implantação do Back-end

```bash
# Criar diretório para a aplicação
mkdir -p /opt/associacao-app

# Copiar os arquivos para o servidor
# (Use scp, rsync ou git clone para transferir os arquivos)

# Navegar até o diretório da aplicação
cd /opt/associacao-app

# Copiar o arquivo .env.production para .env
cp .env.production .env

# Construir e iniciar os containers
docker-compose up -d --build
```

### 4. Configuração do Nginx como Proxy Reverso

Instale e configure o Nginx para atuar como proxy reverso e gerenciar o SSL:

```bash
# Instalar Nginx
apt-get install -y nginx

# Instalar Certbot para SSL
apt-get install -y certbot python3-certbot-nginx
```

Crie um arquivo de configuração para o Nginx:

```nginx
server {
    listen 80;
    server_name comunidade.aneti.org.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve este arquivo em `/etc/nginx/sites-available/comunidade.aneti.org.br` e crie um link simbólico:

```bash
ln -s /etc/nginx/sites-available/comunidade.aneti.org.br /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. Configuração do SSL

```bash
certbot --nginx -d comunidade.aneti.org.br
```

### 6. Verificação da Implantação

Verifique se a aplicação está funcionando corretamente:

```bash
# Verificar os logs do container
docker-compose logs -f

# Testar a API
curl https://comunidade.aneti.org.br/api/health
```

## Manutenção

Para atualizar a aplicação no futuro:

```bash
# Parar os containers
docker-compose down

# Puxar as alterações (se estiver usando git)
git pull

# Reconstruir e iniciar os containers
docker-compose up -d --build
```
