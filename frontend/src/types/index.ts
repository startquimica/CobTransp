export class BaseEntity {
    id!: number;
    tenantId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transportador extends BaseEntity {
    nome: string;
    cnpj: string;
}

export interface Tomador extends BaseEntity {
    nome: string;
    cnpj: string;
}

export interface Nota extends BaseEntity {
    numero: number;
    serie: string;
    dataEntrega?: string;
}

export interface DocumentoFiscal extends BaseEntity {
    numero: number;
    serie: string;
    valor: number;
    dataEmissao: string;
    dataVencimento: string;
    baseCalculo?: number;
    aliquota?: number;
    valorImposto?: number;
    chave?: string;
    tipoDoc: string; // CTE, NFE, NFS
    notas: Nota[];
}

export interface Cobranca extends BaseEntity {
    transportador: Transportador;
    tomador: Tomador;
    ordemCarga: number;
    tipoCobranca: string;
    tipoTransporte: string;
    valor: number;
    status: string;
    documentosFiscais: DocumentoFiscal[];
    dataEnvio?: string;
    protocoloSankhya?: string;
    dataUltimaAlteracao?: string;
}

// --- Importação de Arquivo ---

export interface ErroLinhaDTO {
    linha: number;
    cnpjTomador: string;
    ctrc: string;
    motivo: string;
}

export interface ImportacaoArquivoResultDTO {
    cobrancaId: number | null;
    erros: ErroLinhaDTO[];
}

// --- Dashboard DTOs ---

export interface CobrancaResumoDTO {
    id: number;
    transportadorNome: string;
    tomadorNome: string;
    tipoCobranca: string;
    valor: number;
    status: string;
    dataUltimaAlteracao?: string;
}

export interface TenantStatDTO {
    tenantId: number;
    tenantNome: string;
    totalCobrancas: number;
    totalTransportadores: number;
    totalTomadores: number;
    totalUsuarios: number;
    valorTotal: number;
}

export interface DashboardAdminDTO {
    totalTenants: number;
    tenants: TenantStatDTO[];
}

export interface DashboardTenantDTO {
    totalCobrancas: number;
    totalTransportadores: number;
    totalTomadores: number;
    totalUsuarios: number;
    valorTotalPendente: number;
    valorTotalEnviado: number;
    cobrancasPorStatus: Record<string, number>;
    cobrancasPorTipo: Record<string, number>;
    ultimasCobrancas: CobrancaResumoDTO[];
}
