import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Table } from '../components/common/Table';
import type { Tenant } from '../types';
import { Modal } from '../components/common/Modal';
import { TenantForm } from '../components/forms/TenantForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Tenants = () => {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [data, setData] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tenants');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar tenants', error);
            showToast('Erro ao carregar tenants.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleEdit = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({ title: 'Excluir tenant', message: 'Tem certeza que deseja excluir este tenant?', variant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/tenants/${id}`);
            showToast('Tenant excluído com sucesso!', 'success');
            fetchTenants();
        } catch (error) {
            console.error('Erro ao excluir tenant', error);
            showToast('Erro ao excluir tenant.', 'error');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Tenant },
        { header: 'Nome', accessor: 'nome' as keyof Tenant },
        { header: 'E-mail', accessor: (item: Tenant) => item.email ?? '—' },
        { header: 'Telefone', accessor: (item: Tenant) => item.telefone ?? '—' },
        {
            header: 'API Key',
            accessor: (item: Tenant) => (
                <span className="font-mono text-xs text-gray-500">{item.apiKey ?? '—'}</span>
            )
        },
        {
            header: 'Ações',
            accessor: (item: Tenant) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(item.id)}
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500">Gerenciamento de clientes da plataforma.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchTenants}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedTenant(undefined);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Tenant
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    emptyMessage="Nenhum tenant encontrado."
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedTenant ? "Editar Tenant" : "Novo Tenant"}
                size="xl"
            >
                <TenantForm 
                    initialData={selectedTenant}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchTenants();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Tenants;
