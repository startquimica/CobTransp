-- Campos de informação de contato e endereço para tomadores
ALTER TABLE tomadores
    ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS telefone          VARCHAR(20),
    ADD COLUMN IF NOT EXISTS endereco          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cidade            VARCHAR(100),
    ADD COLUMN IF NOT EXISTS uf                VARCHAR(2),
    ADD COLUMN IF NOT EXISTS cep               VARCHAR(10);

-- Campos de informação de contato e endereço para transportadores
ALTER TABLE transportadores
    ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS telefone          VARCHAR(20),
    ADD COLUMN IF NOT EXISTS endereco          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cidade            VARCHAR(100),
    ADD COLUMN IF NOT EXISTS uf                VARCHAR(2),
    ADD COLUMN IF NOT EXISTS cep               VARCHAR(10);

-- Campos de informação de contato e endereço para tenants
ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS telefone          VARCHAR(20),
    ADD COLUMN IF NOT EXISTS endereco          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cidade            VARCHAR(100),
    ADD COLUMN IF NOT EXISTS uf                VARCHAR(2),
    ADD COLUMN IF NOT EXISTS cep               VARCHAR(10);

-- Telefone para usuários
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
