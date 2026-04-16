CREATE TABLE contatos (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           BIGINT,
    tomador_id          BIGINT,
    transportador_id    BIGINT,
    tenant_direct_id    BIGINT,
    nome                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    telefone            VARCHAR(20),
    cargo               VARCHAR(100),
    FOREIGN KEY (tomador_id)       REFERENCES tomadores(id)       ON DELETE CASCADE,
    FOREIGN KEY (transportador_id) REFERENCES transportadores(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_direct_id) REFERENCES tenants(id)         ON DELETE CASCADE,
    CONSTRAINT chk_contato_owner CHECK (
        (tomador_id IS NOT NULL AND transportador_id IS NULL AND tenant_direct_id IS NULL) OR
        (tomador_id IS NULL AND transportador_id IS NOT NULL AND tenant_direct_id IS NULL) OR
        (tomador_id IS NULL AND transportador_id IS NULL AND tenant_direct_id IS NOT NULL)
    )
);

CREATE INDEX idx_contatos_tomador_id       ON contatos(tomador_id);
CREATE INDEX idx_contatos_transportador_id ON contatos(transportador_id);
CREATE INDEX idx_contatos_tenant_direct_id ON contatos(tenant_direct_id);
