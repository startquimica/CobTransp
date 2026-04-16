import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Table } from '../components/common/Table';
import type { Tomador } from '../types';
import { Modal } from '../components/common/Modal';
import { TomadorForm } from '../components/forms/TomadorForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Tomadores = () => {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [data, setData] = useState<Tomador[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTomador, setSelectedTomador] = useState<Tomador | undefined>();

    const fetchTomadores = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tomadores');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar tomadores', error);
            showToast('Erro ao carregar tomadores.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTomadores();
    }, []);

    const handleEdit = (item: Tomador) => {
        setSelectedTomador(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({ title: 'Excluir tomador', message: 'Tem certeza que deseja excluir este tomador?', variant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/tomadores/${id}`);
            showToast('Tomador excluído com sucesso!', 'success');
            fetchTomadores();
        } catch (error) {
            console.error('Erro ao excluir tomador', error);
            showToast('Erro ao excluir tomador.', 'error');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Tomador },
        { header: 'Nome', accessor: 'nome' as keyof Tomador },
        { header: 'CNPJ', accessor: 'cnpj' as keyof Tomador },
        { header: 'E-mail', accessor: (item: Tomador) => item.email ?? '—' },
        { header: 'Telefone', accessor: (item: Tomador) => item.telefone ?? '—' },
        {
            header: 'Ações',
            accessor: (item: Tomador) => (
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tomadores</h1>
                    <p className="text-sm text-gray-500">Gestão de clientes/tomadores de serviço.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchTomadores}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedTomador(undefined);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Tomador
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    emptyMessage="Nenhum tomador encontrado."
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedTomador ? "Editar Tomador" : "Novo Tomador"}
                size="xl"
            >
                <TomadorForm 
                    initialData={selectedTomador}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchTomadores();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Tomadores;
