CREATE TABLE log_envio_cobranca (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL REFERENCES tenants(id),
    cobranca_id     BIGINT          NOT NULL REFERENCES cobrancas(id) ON DELETE CASCADE,
    data_tentativa  TIMESTAMP       NOT NULL DEFAULT NOW(),
    sucesso         BOOLEAN         NOT NULL,
    protocolo_sankhya VARCHAR(255),
    codigo_erro     VARCHAR(50),
    mensagem_erro   TEXT,
    payload_enviado TEXT            NOT NULL,
    resposta_recebida TEXT,
    url_destino     VARCHAR(500),
    usuario_id      BIGINT          REFERENCES usuarios(id),
    origem          VARCHAR(20)     NOT NULL,
    tempo_resposta_ms BIGINT,
    hash_registro   VARCHAR(64)     NOT NULL
);

CREATE INDEX idx_log_envio_cobranca_cobranca_id ON log_envio_cobranca(cobranca_id);
CREATE INDEX idx_log_envio_cobranca_tenant_id ON log_envio_cobranca(tenant_id);
CREATE INDEX idx_log_envio_cobranca_data_tentativa ON log_envio_cobranca(data_tentativa);
CREATE INDEX idx_log_envio_cobranca_sucesso ON log_envio_cobranca(sucesso);
CREATE UNIQUE INDEX idx_log_envio_cobranca_hash ON log_envio_cobranca(cobranca_id, hash_registro);
