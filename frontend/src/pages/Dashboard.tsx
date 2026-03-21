import { useEffect, useState } from 'react';
import { LayoutDashboard, Receipt, Users, Truck, UserSquare, Building2, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardAdminDTO, DashboardTenantDTO } from '../types';

const STATUS_LABELS: Record<string, string> = { R: 'Rascunho', P: 'Pendente', E: 'Enviada', C: 'Cancelada' };
const STATUS_COLORS: Record<string, string> = {
    R: 'bg-gray-100 text-gray-700',
    P: 'bg-yellow-100 text-yellow-800',
    E: 'bg-green-100 text-green-700',
    C: 'bg-red-100 text-red-700',
};
const TIPO_LABELS: Record<string, string> = {
    NM: 'Normal', CD: 'Carro Dedicado', DG: 'Descarga', DV: 'Devolução',
    DT: 'Dev. Terceiro', DR: 'Diária', PL: 'Paletização', RG: 'Reentrega',
};

const brl = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('pt-BR') : '-';

// ─── ADMIN VIEW ──────────────────────────────────────────────────────────────

const AdminDashboard = ({ data }: { data: DashboardAdminDTO }) => (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Dashboard Administrativo
            </h1>
            <p className="text-sm text-gray-500 mt-1">Estatísticas de uso por tenant.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 inline-flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
                <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total de Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalTenants}</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                    <tr>
                        {['Tenant', 'Cobranças', 'Transportadores', 'Tomadores', 'Usuários', 'Valor Total'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.tenants.map(t => (
                        <tr key={t.tenantId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{t.tenantNome}</td>
                            <td className="px-4 py-3 text-gray-700">{t.totalCobrancas}</td>
                            <td className="px-4 py-3 text-gray-700">{t.totalTransportadores}</td>
                            <td className="px-4 py-3 text-gray-700">{t.totalTomadores}</td>
                            <td className="px-4 py-3 text-gray-700">{t.totalUsuarios}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{brl(t.valorTotal)}</td>
                        </tr>
                    ))}
                    {data.tenants.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                Nenhum tenant cadastrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ─── TENANT VIEW ─────────────────────────────────────────────────────────────

const TenantDashboard = ({ data }: { data: DashboardTenantDTO }) => {
    const countCards = [
        { label: 'Cobranças',       value: data.totalCobrancas,       icon: Receipt,     color: 'text-blue-600',   bg: 'bg-blue-100' },
        { label: 'Transportadores', value: data.totalTransportadores, icon: Truck,       color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Tomadores',       value: data.totalTomadores,       icon: UserSquare,  color: 'text-green-600',  bg: 'bg-green-100' },
        { label: 'Usuários',        value: data.totalUsuarios,        icon: Users,       color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-blue-600" />
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">Visão geral do sistema de cobranças.</p>
            </div>

            {/* Count cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {countCards.map((c, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${c.bg}`}>
                            <c.icon className={`w-6 h-6 ${c.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{c.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Value cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-100">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Valor Pendente</p>
                        <p className="text-2xl font-bold text-amber-700">{brl(data.valorTotalPendente)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-100">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Valor Enviado</p>
                        <p className="text-2xl font-bold text-emerald-700">{brl(data.valorTotalEnviado)}</p>
                    </div>
                </div>
            </div>

            {/* Status + Tipo pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Status das Cobranças</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(data.cobrancasPorStatus).map(([k, v]) => (
                            <span key={k} className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[k] ?? 'bg-gray-100 text-gray-700'}`}>
                                {STATUS_LABELS[k] ?? k}: {v}
                            </span>
                        ))}
                        {Object.keys(data.cobrancasPorStatus).length === 0 && (
                            <span className="text-sm text-gray-400">Sem dados</span>
                        )}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Cobranças por Tipo</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(data.cobrancasPorTipo).map(([k, v]) => (
                            <span key={k} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {TIPO_LABELS[k] ?? k}: {v}
                            </span>
                        ))}
                        {Object.keys(data.cobrancasPorTipo).length === 0 && (
                            <span className="text-sm text-gray-400">Sem dados</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Last 5 cobranças */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Últimas 5 Cobranças</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                        <tr>
                            {['#', 'Transportador', 'Tomador', 'Tipo', 'Valor', 'Status', 'Alterado em'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.ultimasCobrancas.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500">#{c.id}</td>
                                <td className="px-4 py-3 text-gray-700">{c.transportadorNome}</td>
                                <td className="px-4 py-3 text-gray-700">{c.tomadorNome}</td>
                                <td className="px-4 py-3 text-gray-700">{TIPO_LABELS[c.tipoCobranca] ?? c.tipoCobranca}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{brl(c.valor)}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[c.status] ?? c.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{fmtDate(c.dataUltimaAlteracao)}</td>
                            </tr>
                        ))}
                        {data.ultimasCobrancas.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                                    Nenhuma cobrança encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const { user } = useAuth();
    const [adminData, setAdminData] = useState<DashboardAdminDTO | null>(null);
    const [tenantData, setTenantData] = useState<DashboardTenantDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then(r => {
                if (user?.role === 'ADMIN_TENANT') setAdminData(r.data);
                else setTenantData(r.data);
            })
            .catch(e => console.error('Erro ao buscar dashboard', e))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (user?.role === 'ADMIN_TENANT' && adminData) return <AdminDashboard data={adminData} />;
    if (tenantData) return <TenantDashboard data={tenantData} />;
    return null;
};

export default Dashboard;
