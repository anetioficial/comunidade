# Dockerfile para o back-end Node.js
FROM node:20-alpine

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instalar dependências
RUN npm install -g pnpm
RUN pnpm install

# Copiar código-fonte
COPY . .

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
