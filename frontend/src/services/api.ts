import axios from 'axios';
import type { ImportacaoArquivoResultDTO, LogEnvioCobranca } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Permite o envio de cookies entre domínios
});

// O interceptor para adicionar o token via header não é mais necessário
// uma vez que a autenticação será gerenciada por cookies HttpOnly.
// O código abaixo pode ser removido ou comentado.

/*
api.interceptors.request.use(
  (config) => {
    // A lógica de adicionar o token no header foi removida.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Interceptor para tratar erros globais (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? '';
    // Não redireciona para /login em chamadas de verificação de sessão (/auth/me)
    // ou quando já estamos na página de login, para evitar loop infinito.
    const isSessionCheck = requestUrl.includes('/auth/me');
    const isAlreadyOnLogin = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isSessionCheck && !isAlreadyOnLogin) {
      window.location.href = '/login';
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
