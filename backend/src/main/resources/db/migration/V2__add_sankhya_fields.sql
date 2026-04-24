-- Campos para rastreamento da integração com Sankhya
ALTER TABLE cobrancas ADD data_envio       TIMESTAMP;
ALTER TABLE cobrancas ADD protocolo_sankhya VARCHAR(255);
