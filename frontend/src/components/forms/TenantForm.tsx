import React, { useState } from 'react';
import api from '../../services/api';
import { type BaseEntity } from '../../types';

import { useToast } from '../../contexts/ToastContext';

interface Tenant extends BaseEntity {
    nome: string;
    apiKey?: string;
}

interface TenantFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Tenant;
}

export const TenantForm: React.FC<TenantFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await api.put(`/tenants/${initialData.id}`, formData);
                showToast('Tenant atualizado com sucesso!', 'success');
            } else {
                await api.post('/tenants', formData);
                showToast('Tenant criado com sucesso!', 'success');
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar tenant', error);
            showToast('Erro ao salvar tenant.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
            </div>
            {initialData?.apiKey && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input
                        type="text"
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm font-mono text-gray-600 cursor-default"
                        value={initialData.apiKey}
                    />
                    <p className="mt-1 text-xs text-gray-500">Use este valor no header <code>X-API-Key</code> para acessar a API externa.</p>
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
