CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE transportadores (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE tomadores (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE cobrancas (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    transportador_id BIGINT NOT NULL,
    tomador_id BIGINT NOT NULL,
    ordem_carga BIGINT NOT NULL,
    tipo_cobranca VARCHAR(2) NOT NULL,
    tipo_transporte VARCHAR(1) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    status VARCHAR(1) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (transportador_id) REFERENCES transportadores(id),
    FOREIGN KEY (tomador_id) REFERENCES tomadores(id)
);

CREATE TABLE documentos_fiscais (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    cobranca_id BIGINT NOT NULL,
    numero BIGINT NOT NULL,
    serie VARCHAR(50) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    base_calculo DECIMAL(15, 2),
    aliquota DECIMAL(5, 2),
    valor_imposto DECIMAL(15, 2),
    chave VARCHAR(44),
    tipo_doc VARCHAR(3) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (cobranca_id) REFERENCES cobrancas(id)
);

CREATE TABLE notas (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    documento_fiscal_id BIGINT NOT NULL,
    numero BIGINT NOT NULL,
    serie VARCHAR(50) NOT NULL,
    data_entrega DATE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (documento_fiscal_id) REFERENCES documentos_fiscais(id)
);

-- Inserindo o ADMIN_TENANT padrão (senha: admin, encriptada em BCrypt)
-- Role ADMIN_TENANT não tem tenant_id vinculado (null)
INSERT INTO usuarios (nome, email, senha, role) 
VALUES ('Administrador', 'admin@startquimica.com.br', '$2a$10$2H6O9oXF3uOZhM/KzV2.bOA7tVqj.3Aqy.s1.gV7F./Vn4Q5iUe/2', 'ADMIN_TENANT');
