import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import type { Transportador, Tomador, Cobranca, DocumentoFiscal, Nota } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface CobrancaFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Partial<Cobranca>;
}

export const CobrancaForm: React.FC<CobrancaFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const { showToast } = useToast();
    const [transportadores, setTransportadores] = useState<Transportador[]>([]);
    const [tomadores, setTomadores] = useState<Tomador[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        transportadorId: initialData?.transportador?.id || '',
        tomadorId: initialData?.tomador?.id || '',
        ordemCarga: initialData?.ordemCarga || '',
        tipoCobranca: initialData?.tipoCobranca || 'NM',
        tipoTransporte: initialData?.tipoTransporte || 'P',
        status: initialData?.status || 'R',
        documentosFiscais: initialData?.documentosFiscais || [] as DocumentoFiscal[],
    });

    const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});

    const isReadOnly = !!initialData?.id && initialData?.status !== 'R';

    const totalValor = useMemo(() => {
        return formData.documentosFiscais.reduce((sum, doc) => sum + (Number(doc.valor) || 0), 0);
    }, [formData.documentosFiscais]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transpRes, tomRes] = await Promise.all([
                    api.get('/transportadores'),
                    api.get('/tomadores')
                ]);
                setTransportadores(transpRes.data || []);
                setTomadores(tomRes.data || []);
            } catch (error) {
                console.error('Erro ao buscar dados auxiliares', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sanitizeEntity = (id: any) => (id && id !== '' ? { id: Number(id) } : null);
            
            const payload = {
                ...formData,
                valor: totalValor,
                transportador: sanitizeEntity(formData.transportadorId),
                tomador: sanitizeEntity(formData.tomadorId),
                documentosFiscais: formData.documentosFiscais.map(doc => {
                    const { id, notas, ...rest } = doc;
                    return {
                        ...(id && id !== 0 ? { id } : {}),
                        ...rest,
                        notas: notas?.map(nota => {
                            const { id: notaId, ...restNota } = nota;
                            return {
                                ...(notaId && notaId !== 0 ? { id: notaId } : {}),
                                ...restNota
                            };
                        })
                    };
                }),
            };
            if (initialData?.id) {
                await api.put(`/cobrancas/${initialData.id}`, payload);
            } else {
                await api.post('/cobrancas', payload);
            }
            showToast(`Cobrança ${initialData?.id ? 'atualizada' : 'criada'} com sucesso!`, 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar cobrança', error);
            showToast('Erro ao salvar cobrança. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addDocumento = () => {
        const newDoc: DocumentoFiscal = {
            id: 0,
            numero: 0,
            serie: '',
            valor: 0,
            dataEmissao: new Date().toISOString().split('T')[0],
            dataVencimento: new Date().toISOString().split('T')[0],
            tipoDoc: 'CTE',
            notas: []
        };
        setFormData(prev => ({
            ...prev,
            documentosFiscais: [...prev.documentosFiscais, newDoc]
        }));
    };

    const removeDocumento = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documentosFiscais: prev.documentosFiscais.filter((_, i) => i !== index)
        }));
    };

    const updateDocumento = (index: number, data: Partial<DocumentoFiscal>) => {
        setFormData(prev => {
            const newDocs = [...prev.documentosFiscais];
            newDocs[index] = { ...newDocs[index], ...data };
            return { ...prev, documentosFiscais: newDocs };
        });
    };

    const toggleDocExpand = (index: number) => {
        setExpandedDocs(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const addNota = (docIndex: number) => {
        const newNota: Nota = {
            id: 0,
            numero: 0,
            serie: '',
        };
        setFormData(prev => {
            const newDocs = [...prev.documentosFiscais];
            newDocs[docIndex].notas = [...(newDocs[docIndex].notas || []), newNota];
            return { ...prev, documentosFiscais: newDocs };
        });
    };

    const removeNota = (docIndex: number, notaIndex: number) => {
        setFormData(prev => {
            const newDocs = [...prev.documentosFiscais];
            newDocs[docIndex].notas = newDocs[docIndex].notas.filter((_, i) => i !== notaIndex);
            return { ...prev, documentosFiscais: newDocs };
        });
    };

    const updateNota = (docIndex: number, notaIndex: number, data: Partial<Nota>) => {
        setFormData(prev => {
            const newDocs = [...prev.documentosFiscais];
            const newNotas = [...newDocs[docIndex].notas];
            newNotas[notaIndex] = { ...newNotas[notaIndex], ...data };
            newDocs[docIndex].notas = newNotas;
            return { ...prev, documentosFiscais: newDocs };
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {isReadOnly && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md px-4 py-3 text-sm font-medium">
                    Esta cobrança não pode ser editada pois seu status é diferente de Rascunho.
                </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Dados Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transportador</label>
                        <select
                            required
                            disabled={isReadOnly}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.transportadorId}
                            onChange={(e) => setFormData({ ...formData, transportadorId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {transportadores.map((t: Transportador) => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tomador</label>
                        <select
                            required
                            disabled={isReadOnly}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.tomadorId}
                            onChange={(e) => setFormData({ ...formData, tomadorId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {tomadores.map((t: Tomador) => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Cobrança</label>
                        <select
                            disabled={isReadOnly}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.tipoCobranca}
                            onChange={(e) => setFormData({ ...formData, tipoCobranca: e.target.value })}
                        >
                            <option value="NM">Normal</option>
                            <option value="CD">Carro Dedicado</option>
                            <option value="DG">Descarga</option>
                            <option value="DV">Devolução</option>
                            <option value="DT">Devolução Terceiro</option>
                            <option value="DR">Diária</option>
                            <option value="PL">Paletização</option>
                            <option value="RG">Reentrega</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Transporte</label>
                        <select
                            disabled={isReadOnly}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.tipoTransporte}
                            onChange={(e) => setFormData({ ...formData, tipoTransporte: e.target.value })}
                        >
                            <option value="P">Ponto a Ponto</option>
                            <option value="T">Transferência</option>
                            <option value="D">Distribuição</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="R">Rascunho</option>
                            <option value="P">Pendente</option>
                            <option value="E">Enviada</option>
                            <option value="C">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Carga</label>
                        <input
                            type="number"
                            disabled={isReadOnly}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.ordemCarga}
                            onChange={(e) => setFormData({ ...formData, ordemCarga: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-1 lg:col-span-2">
                        <label className="block text-sm font-bold text-blue-800 mb-1">Valor Total (Calculado)</label>
                        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 font-bold text-blue-700 text-lg">
                            R$ {totalValor.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Documentos Fiscais</h3>
                    {!isReadOnly && (
                        <button
                            type="button"
                            onClick={addDocumento}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Documento
                        </button>
                    )}
                </div>

                {formData.documentosFiscais.map((doc, docIndex) => (
                    <div key={docIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                            className="flex items-center justify-between bg-white p-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleDocExpand(docIndex)}
                        >
                            <div className="flex items-center gap-2">
                                {expandedDocs[docIndex] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                <span className="font-medium">
                                    {doc.tipoDoc} {doc.numero ? `nº ${doc.numero}` : '(Novo Documento)'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 font-bold">R$ {Number(doc.valor).toFixed(2)}</span>
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeDocumento(docIndex); }}
                                        className="text-red-600 hover:text-red-800 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {expandedDocs[docIndex] && (
                            <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                        <select
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.tipoDoc}
                                            onChange={(e) => updateDocumento(docIndex, { tipoDoc: e.target.value })}
                                        >
                                            <option value="CTE">CTE</option>
                                            <option value="NFE">NFE</option>
                                            <option value="NFS">NFS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.numero}
                                            onChange={(e) => updateDocumento(docIndex, { numero: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Série</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.serie}
                                            onChange={(e) => updateDocumento(docIndex, { serie: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.valor}
                                            onChange={(e) => updateDocumento(docIndex, { valor: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Emissão</label>
                                        <input
                                            type="date"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.dataEmissao}
                                            onChange={(e) => updateDocumento(docIndex, { dataEmissao: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Vencimento</label>
                                        <input
                                            type="date"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.dataVencimento}
                                            onChange={(e) => updateDocumento(docIndex, { dataVencimento: e.target.value })}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Chave de Acesso</label>
                                        <input
                                            type="text"
                                            maxLength={44}
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.chave || ''}
                                            onChange={(e) => updateDocumento(docIndex, { chave: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Base de Cálculo</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.baseCalculo ?? ''}
                                            onChange={(e) => updateDocumento(docIndex, { baseCalculo: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Alíquota (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.aliquota ?? ''}
                                            onChange={(e) => updateDocumento(docIndex, { aliquota: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor do Imposto</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={doc.valorImposto ?? ''}
                                            onChange={(e) => updateDocumento(docIndex, { valorImposto: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Notas</h4>
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={() => addNota(docIndex)}
                                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                            >
                                                + Add Nota
                                            </button>
                                        )}
                                    </div>
                                    {doc.notas && doc.notas.length > 0 ? (
                                        <div className="space-y-2">
                                            {doc.notas.map((nota, notaIndex) => (
                                                <div key={notaIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500">Número</label>
                                                        <input
                                                            type="number"
                                                            disabled={isReadOnly}
                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            value={nota.numero}
                                                            onChange={(e) => updateNota(docIndex, notaIndex, { numero: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500">Série</label>
                                                        <input
                                                            type="text"
                                                            disabled={isReadOnly}
                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            value={nota.serie}
                                                            onChange={(e) => updateNota(docIndex, notaIndex, { serie: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500">Data Entrega</label>
                                                        <input
                                                            type="date"
                                                            disabled={isReadOnly}
                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            value={nota.dataEntrega || ''}
                                                            onChange={(e) => updateNota(docIndex, notaIndex, { dataEntrega: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pb-1">
                                                        {!isReadOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNota(docIndex, notaIndex)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">Nenhuma nota vinculada.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 mt-8 pb-4">
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
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 shadow-sm"
                >
                    {loading ? 'Salvando...' : (initialData?.id ? 'Atualizar Cobrança' : 'Criar Cobrança')}
                </button>
            </div>
        </form>
    );
};
