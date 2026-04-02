import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { importarArquivo } from '../../services/api';
import type { ImportacaoArquivoResultDTO } from '../../types';

type Formato = 'CSV' | 'POSICIONAL' | 'CONEMB';
type ModalState = 'idle' | 'loading' | 'result';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TIPO_COBRANCA_OPTIONS = [
    { value: 'NM', label: 'Normal' },
    { value: 'CD', label: 'Carro Dedicado' },
    { value: 'DG', label: 'Descarga' },
    { value: 'DV', label: 'Devolução' },
    { value: 'DT', label: 'Dev. Terceiro' },
    { value: 'DR', label: 'Diária' },
    { value: 'PL', label: 'Paletização' },
    { value: 'RG', label: 'Reentrega' },
];

const TIPO_TRANSPORTE_OPTIONS = [
    { value: 'P', label: 'Ponto a Ponto' },
    { value: 'T', label: 'Transferência' },
    { value: 'D', label: 'Distribuição' },
];

const TIPO_DOCUMENTO_OPTIONS = [
    { value: 'NFE', label: 'NF-e' },
    { value: 'CTE', label: 'CT-e' },
    { value: 'NFS', label: 'NFS' },
];

export const ImportarArquivoModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [modalState, setModalState] = useState<ModalState>('idle');
    const [formato, setFormato] = useState<Formato>('CSV');
    const [tipoCobranca, setTipoCobranca] = useState('NM');
    const [tipoTransporte, setTipoTransporte] = useState('P');
    const [tipoDocumento, setTipoDocumento] = useState('CTE');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportacaoArquivoResultDTO | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const acceptedExtension = formato === 'CSV' ? '.csv' : '.txt';

    const handleFormatoChange = (novoFormato: Formato) => {
        setFormato(novoFormato);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setModalState('loading');
        setErrorMessage('');
        try {
            const res = await importarArquivo(selectedFile, formato, tipoCobranca, tipoTransporte, tipoDocumento);
            setResult(res);
            setModalState('result');
            if (res.cobrancaId) onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Erro ao importar arquivo.';
            setErrorMessage(msg);
            setModalState('idle');
        }
    };

    const handleClose = () => {
        setModalState('idle');
        setSelectedFile(null);
        setResult(null);
        setErrorMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const renderIdle = () => (
        <div className="space-y-4">
            {errorMessage && (
                <div className="flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato do Arquivo</label>
                <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={formato}
                    onChange={e => handleFormatoChange(e.target.value as Formato)}
                >
                    <option value="CSV">CSV (separador ;)</option>
                    <option value="POSICIONAL">Texto Posicional (largura fixa)</option>
                    <option value="CONEMB">CONEMB (Conhecimento de Transporte)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo <span className="text-gray-400 font-normal">({acceptedExtension})</span>
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedExtension}
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cobrança</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={tipoCobranca}
                        onChange={e => setTipoCobranca(e.target.value)}
                    >
                        {TIPO_COBRANCA_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transporte</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={tipoTransporte}
                        onChange={e => setTipoTransporte(e.target.value)}
                    >
                        {TIPO_TRANSPORTE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={tipoDocumento}
                        onChange={e => setTipoDocumento(e.target.value)}
                    >
                        {TIPO_DOCUMENTO_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderResult = () => {
        if (!result) return null;
        const success = !!result.cobrancaId;
        return (
            <div className="space-y-4">
                <div className={`flex gap-3 items-center p-4 rounded-md ${success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {success
                        ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    <p className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success
                            ? `Cobrança #${result.cobrancaId} criada com sucesso!`
                            : 'Importação falhou.'}
                    </p>
                </div>

                {result.erros.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            {result.erros.length} erro(s) encontrado(s):
                        </p>
                        <div className="overflow-auto max-h-60 border border-gray-200 rounded-md">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Linha</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">CTRC</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">CNPJ Tomador</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {result.erros.map((erro, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">{erro.linha}</td>
                                            <td className="px-3 py-2">{erro.ctrc || '-'}</td>
                                            <td className="px-3 py-2">{erro.cnpjTomador || '-'}</td>
                                            <td className="px-3 py-2 text-red-600">{erro.motivo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const footer = (
        <>
            {modalState === 'idle' && (
                <>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFile}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="w-4 h-4" />
                        Importar
                    </button>
                </>
            )}
            {modalState === 'loading' && (
                <span className="text-sm text-gray-500">Importando...</span>
            )}
            {modalState === 'result' && (
                <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Fechar
                </button>
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Importar Arquivo"
            size="lg"
            closeOnEsc={modalState !== 'loading'}
            footer={footer}
        >
            {modalState === 'result' ? renderResult() : renderIdle()}
        </Modal>
    );
};
