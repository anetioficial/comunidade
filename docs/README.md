# ANETI - Associação Nacional de Especialistas em Tecnologia da Informação

Este repositório contém o código-fonte do MVP da plataforma ANETI, uma associação profissional para especialistas em TI, com versões web e mobile.

## Estrutura do Projeto

O projeto está organizado em três componentes principais:

- **Backend**: API REST em Node.js com Express e PostgreSQL
- **Frontend Web**: Aplicação React com TypeScript
- **Frontend Mobile**: Aplicação React Native para Android e iOS

## Requisitos

### Backend
- Node.js 16.x ou superior
- PostgreSQL 14.x ou superior
- NPM ou Yarn

### Frontend Web
- Node.js 16.x ou superior
- NPM ou Yarn

### Frontend Mobile
- Node.js 16.x ou superior
- React Native CLI
- Android Studio (para build Android)
- Xcode (para build iOS, requer macOS)

## Instalação e Configuração

### Backend

```bash
# Navegar para o diretório do backend
cd associacao_app/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar migrações do banco de dados
psql -U seu_usuario -d seu_banco -f src/migrations/create_tables.sql

# Iniciar o servidor em modo de desenvolvimento
npm run dev
```

### Frontend Web

```bash
# Navegar para o diretório do frontend web
cd associacao-web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar o servidor de desenvolvimento
npm start
```

### Frontend Mobile

```bash
# Navegar para o diretório do frontend mobile
cd aneti-mvp/frontend

# Instalar dependências
npm install

# Iniciar o Metro Bundler
npm start

# Em outro terminal, iniciar o aplicativo no Android
npm run android

# Ou iniciar o aplicativo no iOS (apenas macOS)
npm run ios
```

## Funcionalidades Principais

- Cadastro de novos membros com diferentes planos
- Upload de documentos para verificação
- Pagamento de anuidade via Mercado Pago
- Painel administrativo para aprovação de cadastros
- Gerenciamento de planos e usuários

## Documentação

A documentação completa está disponível nos seguintes arquivos:

- [Documentação de Implantação](docs/documentacao_implantacao.md)
- [Guia do Usuário](docs/guia_usuario.md)
- [Resumo do Projeto](docs/resumo_projeto.md)

## Licença

Este projeto é propriedade da ANETI e seu uso é restrito conforme os termos estabelecidos.

## Contato

Para suporte técnico ou dúvidas:
- Email: suporte@aneti.org.br
