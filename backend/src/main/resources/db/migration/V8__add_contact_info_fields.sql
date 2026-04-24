-- Campos de informação de contato e endereço para tomadores
ALTER TABLE tomadores ADD inscricao_estadual VARCHAR2(20);
ALTER TABLE tomadores ADD email VARCHAR2(255);
ALTER TABLE tomadores ADD telefone VARCHAR2(20);
ALTER TABLE tomadores ADD endereco VARCHAR2(255);
ALTER TABLE tomadores ADD cidade VARCHAR2(100);
ALTER TABLE tomadores ADD uf VARCHAR2(2);
ALTER TABLE tomadores ADD cep VARCHAR2(10);

-- Campos de informação de contato e endereço para transportadores
ALTER TABLE transportadores ADD inscricao_estadual VARCHAR2(20);
ALTER TABLE transportadores ADD email VARCHAR2(255);
ALTER TABLE transportadores ADD telefone VARCHAR2(20);
ALTER TABLE transportadores ADD endereco VARCHAR2(255);
ALTER TABLE transportadores ADD cidade VARCHAR2(100);
ALTER TABLE transportadores ADD uf VARCHAR2(2);
ALTER TABLE transportadores ADD cep VARCHAR2(10);

-- Campos de informação de contato e endereço para tenants
ALTER TABLE tenants ADD inscricao_estadual VARCHAR2(20);
ALTER TABLE tenants ADD email VARCHAR2(255);
ALTER TABLE tenants ADD telefone VARCHAR2(20);
ALTER TABLE tenants ADD endereco VARCHAR2(255);
ALTER TABLE tenants ADD cidade VARCHAR2(100);
ALTER TABLE tenants ADD uf VARCHAR2(2);
ALTER TABLE tenants ADD cep VARCHAR2(10);

-- Telefone para usuários
ALTER TABLE usuarios ADD telefone VARCHAR2(20);
