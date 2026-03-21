import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Pencil, Trash2, Send, AlertCircle, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Table } from '../components/common/Table';
import type { Cobranca } from '../types';
import { Modal } from '../components/common/Modal';
import { CobrancaForm } from '../components/forms/CobrancaForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const DEFAULT_FILTERS = {
    status: 'R,P',
    tipoCobranca: '',
    tipoTransporte: '',
    transportador: '',
    alteracaoDe: '',
    alteracaoAte: '',
    envioDe: '',
    envioAte: '',
};

const Cobrancas = () => {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [data, setData] = useState<Cobranca[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | undefined>();
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const hasActiveFilters = (Object.keys(filters) as Array<keyof typeof filters>).some(
        k => filters[k] !== DEFAULT_FILTERS[k]
    );

    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setPage(0);
    };

    const fetchCobrancas = useCallback(async (currentPage = page) => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                page: String(currentPage),
                size: String(PAGE_SIZE),
            };
            if (filters.status)         params.status         = filters.status;
            if (filters.tipoCobranca)   params.tipoCobranca   = filters.tipoCobranca;
            if (filters.tipoTransporte) params.tipoTransporte = filters.tipoTransporte;
            if (filters.transportador)  params.transportador  = filters.transportador;
            if (filters.alteracaoDe)    params.alteracaoDe    = filters.alteracaoDe;
            if (filters.alteracaoAte)   params.alteracaoAte   = filters.alteracaoAte;
            if (filters.envioDe)        params.envioDe        = filters.envioDe;
            if (filters.envioAte)       params.envioAte       = filters.envioAte;

            const response = await api.get('/cobrancas', { params });
            setData(response.data.content || []);
            setTotalElements(response.data.totalElements || 0);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error('Erro ao buscar cobranças', error);
            showToast('Erro ao carregar cobranças.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        setPage(0);
        fetchCobrancas(0);
    }, [filters]);

    useEffect(() => {
        fetchCobrancas(page);
    }, [page]);

    const handleEdit = (item: Cobranca) => {
        setSelectedCobranca(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({ title: 'Excluir cobrança', message: 'Tem certeza que deseja excluir esta cobrança?', variant: 'danger' });
        if (!ok) return;
        try {
            await api.delete('/cobrancas/' + id);
            showToast('Cobrança excluída com sucesso!', 'success');
            fetchCobrancas(page);
        } catch (error) {
            console.error('Erro ao excluir cobrança', error);
            showToast('Erro ao excluir cobrança.', 'error');
        }
    };

    const handleEnviar = async (item: Cobranca) => {
        const ok = await confirm({ title: 'Enviar cobrança', message: `Enviar cobrança #${item.id} para o sistema externo?`, confirmLabel: 'Enviar', variant: 'primary' });
        if (!ok) return;
        try {
            await api.post('/cobrancas/' + item.id + '/enviar');
            showToast('Cobrança enviada com sucesso!', 'success');
            fetchCobrancas(page);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Erro ao enviar cobrança.';
            setErrorModal({ open: true, message: msg });
        }
    };

    const statusColors: Record<string, string> = {
        'R': 'bg-gray-100 text-gray-800',
        'P': 'bg-yellow-100 text-yellow-800',
        'E': 'bg-blue-100 text-blue-800',
        'C': 'bg-red-100 text-red-800',
    };

    const statusLabels: Record<string, string> = {
        'R': 'Rascunho',
        'P': 'Pendente',
        'E': 'Enviada',
        'C': 'Cancelada',
    };

    const tipoCobrancaLabels: Record<string, string> = {
        'NM': 'Normal',
        'CD': 'Carro Dedicado',
        'DG': 'Descarga',
        'DV': 'Devolução',
        'DT': 'Dev. Terceiro',
        'DR': 'Diária',
        'PL': 'Paletização',
        'RG': 'Reentrega',
    };

    const tipoTransporteLabels: Record<string, string> = {
        'P': 'Ponto a Ponto',
        'T': 'Transferência',
        'D': 'Distribuição',
    };

    const columns = [
        { header: 'ID', accessor: (item: any) => String(item?.id || '-') },
        { header: 'Número', accessor: (item: any) => String(item?.numero || '-') },
        { 
            header: 'Transportador', 
            accessor: (item: any) => item?.transportador?.nome || '-' 
        },
        { 
            header: 'Tomador', 
            accessor: (item: any) => item?.tomador?.nome || '-' 
        },
        { 
            header: 'Tipo', 
            accessor: (item: any) => {
                if (!item) return '-';
                const labelCobranca = tipoCobrancaLabels[item.tipoCobranca] || item.tipoCobranca || '-';
                const labelTransp = tipoTransporteLabels[item.tipoTransporte] || item.tipoTransporte || '-';
                return (
                    <div className="flex flex-col text-[10px]">
                        <span className="font-bold text-gray-700">{labelCobranca}</span>
                        <span className="text-gray-500">{labelTransp}</span>
                    </div>
                );
            }
        },
        { 
            header: 'Valor', 
            accessor: (item: any) => 'R$ ' + Number(item?.valor || 0).toFixed(2)
        },
        { 
            header: 'Status', 
            accessor: (item: any) => {
                const status = item?.status || '';
                return (
                    <span className={'px-2 py-1 rounded-full text-[10px] font-semibold ' + (statusColors[status] || 'bg-gray-100')}>
                        {statusLabels[status] || status || '-'}
                    </span>
                );
            }
        },
        {
            header: 'Últ. Alteração',
            accessor: (item: any) => {
                if (!item?.dataUltimaAlteracao) return '-';
                const d = new Date(item.dataUltimaAlteracao);
                return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
        },
        {
            header: 'Ações',
            accessor: (item: any) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEnviar(item)}
                        disabled={item?.status !== 'P'}
                        title={item?.status === 'P' ? 'Enviar para sistema externo' : 'Somente cobranças pendentes podem ser enviadas'}
                        className={'p-1 rounded ' + (item?.status !== 'P'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-green-600 hover:bg-green-50')}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(item?.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cobranças</h1>
                    <p className="text-sm text-gray-500">Gerenciamento de faturas e documentos fiscais.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={'p-2 rounded-md transition-colors ' + (showFilters || hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')}
                        title="Filtros"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => fetchCobrancas(page)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className={'w-5 h-5 ' + (loading ? 'animate-spin' : '')} />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedCobranca(undefined);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Cobrança
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Filter className="w-4 h-4" /> Filtros</span>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                                <X className="w-3 h-3" /> Limpar filtros
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                {[{ value: 'R', label: 'Rascunho' }, { value: 'P', label: 'Pendente' }, { value: 'E', label: 'Enviada' }, { value: 'C', label: 'Cancelada' }].map(({ value, label }) => (
                                    <label key={value} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={filters.status.split(',').filter(Boolean).includes(value)}
                                            onChange={e => {
                                                const current = filters.status.split(',').filter(Boolean);
                                                const updated = e.target.checked ? [...current, value] : current.filter(s => s !== value);
                                                setFilters(f => ({ ...f, status: updated.join(',') }));
                                                setPage(0);
                                            }}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Cobrança</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                value={filters.tipoCobranca}
                                onChange={e => setFilters(f => ({ ...f, tipoCobranca: e.target.value }))}
                            >
                                <option value="">Todos</option>
                                <option value="NM">Normal</option>
                                <option value="CD">Carro Dedicado</option>
                                <option value="DG">Descarga</option>
                                <option value="DV">Devolução</option>
                                <option value="DT">Dev. Terceiro</option>
                                <option value="DR">Diária</option>
                                <option value="PL">Paletização</option>
                                <option value="RG">Reentrega</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Transporte</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                value={filters.tipoTransporte}
                                onChange={e => setFilters(f => ({ ...f, tipoTransporte: e.target.value }))}
                            >
                                <option value="">Todos</option>
                                <option value="P">Ponto a Ponto</option>
                                <option value="T">Transferência</option>
                                <option value="D">Distribuição</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Transportador</label>
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                value={filters.transportador}
                                onChange={e => setFilters(f => ({ ...f, transportador: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-500">Período de Alteração</label>
                            <div className="flex gap-2">
                                <input type="date" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" value={filters.alteracaoDe} onChange={e => setFilters(f => ({ ...f, alteracaoDe: e.target.value }))} />
                                <input type="date" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" value={filters.alteracaoAte} onChange={e => setFilters(f => ({ ...f, alteracaoAte: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-500">Período de Envio</label>
                            <div className="flex gap-2">
                                <input type="date" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" value={filters.envioDe} onChange={e => setFilters(f => ({ ...f, envioDe: e.target.value }))} />
                                <input type="date" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" value={filters.envioAte} onChange={e => setFilters(f => ({ ...f, envioAte: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <p className="text-xs text-gray-500">{totalElements} registros encontrados</p>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    emptyMessage="Nenhuma cobrança encontrada."
                />                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                            Exibindo {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} de {totalElements}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 0}
                                className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-700">Página {page + 1} de {totalPages}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}            </div>

            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Erro ao enviar cobrança"
                size="sm"
                closeOnOverlayClick
                closeOnEsc
                footer={
                    <div className="flex justify-end">
                        <button
                            onClick={() => setErrorModal({ open: false, message: '' })}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                }
            >
                <div className="flex gap-3 items-start p-1">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{errorModal.message}</p>
                </div>
            </Modal>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedCobranca ? "Editar Cobrança" : "Nova Cobrança"}
                size="xl"
            >
                <CobrancaForm 
                    initialData={selectedCobranca}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchCobrancas(page);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Cobrancas;
