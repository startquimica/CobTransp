
export interface JwtPayload {
  id: number;
  tenantId?: number;
  nome: string;
  sub: string;
  role: 'ADMIN_TENANT' | 'GERENTE' | 'OPERADOR' | 'VISUALIZADOR';
  exp: number;
}
