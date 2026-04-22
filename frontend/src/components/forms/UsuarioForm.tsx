import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth, type User } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { type Tenant } from '../../types';

interface UsuarioFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: User;
}

export const UsuarioForm: React.FC<UsuarioFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        email: initialData?.email || '',
        senha: '',
        telefone: initialData?.telefone || '',
        role: initialData?.role || 'OPERADOR',
        tenantId: initialData?.tenantId || undefined as number | undefined,
    });

    useEffect(() => {
        if (currentUser?.role === 'ADMIN_TENANT') {
            fetchTenants();
        } else if (!initialData?.id) {
            // Auto-assign current tenant for non-admins
            setFormData(prev => ({ ...prev, tenantId: currentUser?.tenantId }));
        }
    }, [currentUser, initialData]);

    const fetchTenants = async () => {
        try {
            const response = await api.get('/tenants');
            setTenants(response.data);
        } catch (error) {
            console.error('Erro ao buscar tenants', error);
            showToast('Erro ao carregar lista de tenants.', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Non-ADMIN_TENANT users MUST have a tenantId
        if (formData.role !== 'ADMIN_TENANT' && !formData.tenantId) {
            showToast('Por favor, selecione uma tenant para este perfil.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            if (formData.role === 'ADMIN_TENANT') {
                delete payload.tenantId; // Admins don't need tenantId
            }

            if (initialData?.id) {
                await api.put(`/usuarios/${initialData.id}`, payload);
                showToast('Usuário atualizado com sucesso!', 'success');
            } else {
                await api.post('/usuarios', payload);
                showToast('Usuário criado com sucesso!', 'success');
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar usuário', error);
            showToast('Erro ao salvar usuário. Verifique os dados.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {initialData?.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input
                    type="password"
                    required={!initialData?.id}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                >
                    {currentUser?.role === 'ADMIN_TENANT' && (
                        <option value="ADMIN_TENANT">Administrador Geral</option>
                    )}
                    <option value="GERENTE">Gerente</option>
                    <option value="OPERADOR">Operador</option>
                    <option value="VISUALIZADOR">Visualizador</option>
                </select>
            </div>

            {currentUser?.role === 'ADMIN_TENANT' && formData.role !== 'ADMIN_TENANT' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                    <select
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.tenantId || ''}
                        onChange={(e) => setFormData({ ...formData, tenantId: Number(e.target.value) })}
                    >
                        <option value="">Selecione uma tenant</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};
