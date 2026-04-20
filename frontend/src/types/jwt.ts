
export interface JwtPayload {
  id: number;
  tenantId?: number;
  nome: string;
  sub: string;
  role: 'ADMIN' | 'USER';
  exp: number;
}
