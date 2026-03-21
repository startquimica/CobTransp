-- Campos para rastreamento da integração com Sankhya
ALTER TABLE cobrancas
    ADD COLUMN data_envio       TIMESTAMP,
    ADD COLUMN protocolo_sankhya VARCHAR(255);
