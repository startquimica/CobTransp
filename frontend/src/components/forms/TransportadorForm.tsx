import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import type { Transportador, Contato } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface TransportadorFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Partial<Transportador>;
}

const UF_OPTIONS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const emptyContato = (): Contato => ({ nome: '', email: '', telefone: '', cargo: '' });

export const TransportadorForm: React.FC<TransportadorFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        cnpj: initialData?.cnpj || '',
        inscricaoEstadual: initialData?.inscricaoEstadual || '',
        email: initialData?.email || '',
        telefone: initialData?.telefone || '',
        endereco: initialData?.endereco || '',
        cidade: initialData?.cidade || '',
        uf: initialData?.uf || '',
        cep: initialData?.cep || '',
        contatos: (initialData?.contatos ?? []) as Contato[],
    });

    const set = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const addContato = () =>
        setFormData(prev => ({ ...prev, contatos: [...prev.contatos, emptyContato()] }));

    const removeContato = (index: number) =>
        setFormData(prev => ({ ...prev, contatos: prev.contatos.filter((_, i) => i !== index) }));

    const updateContato = (index: number, field: keyof Contato, value: string) =>
        setFormData(prev => {
            const updated = [...prev.contatos];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, contatos: updated };
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                contatos: formData.contatos.map(c => {
                    const { id, ...rest } = c;
                    return id && id !== 0 ? { id, ...rest } : rest;
                }),
            };
            if (initialData?.id) {
                await api.put(`/transportadores/${initialData.id}`, payload);
            } else {
                await api.post('/transportadores', payload);
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

    const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">

            {/* Dados Cadastrais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Dados Cadastrais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <label className={labelClass}>Nome / Razão Social</label>
                        <input type="text" required className={inputClass} value={formData.nome}
                            onChange={e => set('nome', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>CNPJ</label>
                        <input type="text" required className={inputClass} placeholder="00.000.000/0000-00"
                            value={formData.cnpj} onChange={e => set('cnpj', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Inscrição Estadual</label>
                        <input type="text" className={inputClass} value={formData.inscricaoEstadual}
                            onChange={e => set('inscricaoEstadual', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Contato Principal */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Contato Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>E-mail</label>
                        <input type="email" className={inputClass} value={formData.email}
                            onChange={e => set('email', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Telefone</label>
                        <input type="text" className={inputClass} placeholder="(00) 00000-0000"
                            value={formData.telefone} onChange={e => set('telefone', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-4">
                        <label className={labelClass}>Endereço</label>
                        <input type="text" className={inputClass} placeholder="Rua, número, complemento"
                            value={formData.endereco} onChange={e => set('endereco', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Cidade</label>
                        <input type="text" className={inputClass} value={formData.cidade}
                            onChange={e => set('cidade', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>UF</label>
                        <select className={inputClass} value={formData.uf} onChange={e => set('uf', e.target.value)}>
                            <option value="">—</option>
                            {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>CEP</label>
                        <input type="text" className={inputClass} placeholder="00000-000"
                            value={formData.cep} onChange={e => set('cep', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Contatos */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Contatos</h3>
                    <button type="button" onClick={addContato}
                        className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                        <Plus className="w-3 h-3" /> Adicionar
                    </button>
                </div>
                {formData.contatos.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Nenhum contato adicionado.</p>
                )}
                <div className="space-y-3">
                    {formData.contatos.map((contato, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start border border-gray-200 rounded p-3 bg-white">
                            <div>
                                <label className={labelClass}>Nome</label>
                                <input type="text" required className={inputClass} value={contato.nome}
                                    onChange={e => updateContato(idx, 'nome', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Cargo</label>
                                <input type="text" className={inputClass} value={contato.cargo ?? ''}
                                    onChange={e => updateContato(idx, 'cargo', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>E-mail</label>
                                <input type="email" className={inputClass} value={contato.email ?? ''}
                                    onChange={e => updateContato(idx, 'email', e.target.value)} />
                            </div>
                            <div className="relative">
                                <label className={labelClass}>Telefone</label>
                                <div className="flex gap-1">
                                    <input type="text" className={inputClass} value={contato.telefone ?? ''}
                                        onChange={e => updateContato(idx, 'telefone', e.target.value)} />
                                    <button type="button" onClick={() => removeContato(idx)}
                                        className="text-red-600 hover:text-red-800 p-1 flex-shrink-0 mt-0.5">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                    {loading ? 'Salvando...' : 'Salvar Transportador'}
                </button>
            </div>
        </form>
    );
};
