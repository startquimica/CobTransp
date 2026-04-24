CREATE INDEX idx_cobrancas_status ON cobrancas(status);
CREATE INDEX idx_cobrancas_tipo_cobranca ON cobrancas(tipo_cobranca);
CREATE INDEX idx_cobrancas_tipo_transporte ON cobrancas(tipo_transporte);
CREATE INDEX idx_cobrancas_data_ultima_alteracao ON cobrancas(data_ultima_alteracao);
CREATE INDEX idx_cobrancas_data_envio ON cobrancas(data_envio);
CREATE INDEX idx_cobrancas_transportador_id ON cobrancas(transportador_id);
