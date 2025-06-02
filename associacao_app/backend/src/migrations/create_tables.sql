-- Arquivo de migração para criar as tabelas necessárias para o MVP da ANETI

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'id_document', 'experience_document', etc.
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de registros pendentes
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    plan_id INTEGER REFERENCES plans(id),
    linkedin_profile VARCHAR(255),
    discount_code VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    payment_reference VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de aprovações
CREATE TABLE IF NOT EXISTS approvals (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- 'approved', 'rejected'
    justification TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS discount_coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage INTEGER NOT NULL,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO plans (name, price, is_public, description) VALUES
('Público', 0.00, true, 'Plano gratuito para membros da comunidade'),
('Júnior', 99.90, false, 'Plano para profissionais em início de carreira'),
('Pleno', 119.90, false, 'Plano para profissionais com experiência intermediária'),
('Sênior', 129.90, false, 'Plano para profissionais experientes');
