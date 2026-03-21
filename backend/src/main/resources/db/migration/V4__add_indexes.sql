CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON cobrancas(status);
CREATE INDEX IF NOT EXISTS idx_cobrancas_tipo_cobranca ON cobrancas(tipo_cobranca);
CREATE INDEX IF NOT EXISTS idx_cobrancas_tipo_transporte ON cobrancas(tipo_transporte);
CREATE INDEX IF NOT EXISTS idx_cobrancas_data_ultima_alteracao ON cobrancas(data_ultima_alteracao);
CREATE INDEX IF NOT EXISTS idx_cobrancas_data_envio ON cobrancas(data_envio);
CREATE INDEX IF NOT EXISTS idx_cobrancas_transportador_id ON cobrancas(transportador_id);
