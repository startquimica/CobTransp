import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Table } from '../components/common/Table';
import type { Transportador } from '../types';
import { Modal } from '../components/common/Modal';
import { TransportadorForm } from '../components/forms/TransportadorForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Transportadores = () => {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [data, setData] = useState<Transportador[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransportador, setSelectedTransportador] = useState<Transportador | undefined>();

    const fetchTransportadores = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transportadores');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar transportadores', error);
            showToast('Erro ao carregar transportadores.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransportadores();
    }, []);

    const handleEdit = (item: Transportador) => {
        setSelectedTransportador(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({ title: 'Excluir transportador', message: 'Tem certeza que deseja excluir este transportador?', variant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/transportadores/${id}`);
            showToast('Transportador excluído com sucesso!', 'success');
            fetchTransportadores();
        } catch (error) {
            console.error('Erro ao excluir transportador', error);
            showToast('Erro ao excluir transportador.', 'error');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Transportador },
        { header: 'Nome', accessor: 'nome' as keyof Transportador },
        { header: 'CNPJ', accessor: 'cnpj' as keyof Transportador },
        { header: 'E-mail', accessor: (item: Transportador) => item.email ?? '—' },
        { header: 'Telefone', accessor: (item: Transportador) => item.telefone ?? '—' },
        {
            header: 'Ações',
            accessor: (item: Transportador) => (
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transportadores</h1>
                    <p className="text-sm text-gray-500">Gestão de empresas de transporte parceiras.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchTransportadores}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedTransportador(undefined);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Transportador
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    emptyMessage="Nenhum transportador encontrado."
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedTransportador ? "Editar Transportador" : "Novo Transportador"}
                size="xl"
            >
                <TransportadorForm 
                    initialData={selectedTransportador}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchTransportadores();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Transportadores;
