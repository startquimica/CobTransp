import { useEffect, useState } from 'react';
import { UserPlus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Table } from '../components/common/Table';
import type { User } from '../contexts/AuthContext';
import { Modal } from '../components/common/Modal';
import { UsuarioForm } from '../components/forms/UsuarioForm';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Usuarios = () => {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await api.get('/usuarios');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar usuários', error);
            showToast('Erro ao carregar usuários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({ title: 'Excluir usuário', message: 'Tem certeza que deseja excluir este usuário?', variant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/usuarios/${id}`);
            showToast('Usuário excluído com sucesso!', 'success');
            fetchUsuarios();
        } catch (error) {
            console.error('Erro ao excluir usuário', error);
            showToast('Erro ao excluir usuário.', 'error');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof User },
        { header: 'Nome', accessor: 'nome' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'Telefone', accessor: (item: User) => item.telefone ?? '—' },
        { 
            header: 'Role', 
            accessor: (item: User) => (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {item.role}
                </span>
            )
        },
        {
            header: 'Ações',
            accessor: (item: User) => (
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Usuários</h1>
                    <p className="text-sm text-gray-500">Gestão de acessos à plataforma.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchUsuarios}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedUser(undefined);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Novo Usuário
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    emptyMessage="Nenhum usuário encontrado."
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
            >
                <UsuarioForm 
                    initialData={selectedUser}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchUsuarios();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Usuarios;
