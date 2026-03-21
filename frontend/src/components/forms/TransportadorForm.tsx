import React, { useState } from 'react';
import api from '../../services/api';
import type { Transportador } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface TransportadorFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Partial<Transportador>;
}

export const TransportadorForm: React.FC<TransportadorFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        cnpj: initialData?.cnpj || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await api.put(`/transportadores/${initialData.id}`, formData);
            } else {
                await api.post('/transportadores', formData);
            }
            showToast(`Transportador ${initialData?.id ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar transportador', error);
            showToast('Erro ao salvar transportador. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Razão Social</label>
                <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                    {loading ? 'Salvando...' : 'Salvar Transportador'}
                </button>
            </div>
        </form>
    );
};
