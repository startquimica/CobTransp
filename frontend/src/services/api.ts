import axios from 'axios';
import type { ImportacaoArquivoResultDTO, LogEnvioCobranca } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros globais (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      // Poderia redirecionar para /login aqui se necessário
    }
    return Promise.reject(error);
  }
);

export function importarArquivo(
    file: File,
    formato: string,
    tipoCobranca: string,
    tipoTransporte: string,
    tipoDocumento: string
): Promise<ImportacaoArquivoResultDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formato', formato);
    formData.append('tipoCobranca', tipoCobranca);
    formData.append('tipoTransporte', tipoTransporte);
    formData.append('tipoDocumento', tipoDocumento);
    return api.post('/cobrancas/importar-arquivo', formData, {
        headers: { 'Content-Type': undefined },
    }).then(r => r.data);
}

export function getLogsEnvio(
    cobrancaId: number,
    page: number = 0,
    size: number = 20
): Promise<{ content: LogEnvioCobranca[]; totalElements: number; totalPages: number }> {
    return api.get(`/cobrancas/${cobrancaId}/logs-envio`, {
        params: { page, size },
    }).then(r => r.data);
}

export default api;
