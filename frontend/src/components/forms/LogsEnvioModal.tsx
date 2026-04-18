import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { getLogsEnvio } from '../../services/api';
import type { LogEnvioCobranca } from '../../types';

interface LogsEnvioModalProps {
    isOpen: boolean;
    onClose: () => void;
    cobrancaId: number;
}

const origemLabels: Record<string, string> = {
    MANUAL: 'Manual',
    API_EXTERNA: 'API Externa',
    IMPORTACAO: 'Importação',
};

export const LogsEnvioModal: React.FC<LogsEnvioModalProps> = ({ isOpen, onClose, cobrancaId }) => {
    const [logs, setLogs] = useState<LogEnvioCobranca[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [detailLog, setDetailLog] = useState<LogEnvioCobranca | null>(null);
    const PAGE_SIZE = 10;

    const fetchLogs = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const result = await getLogsEnvio(cobrancaId, p, PAGE_SIZE);
            setLogs(result.content || []);
            setTotalPages(result.totalPages || 0);
            setTotalElements(result.totalElements || 0);
        } catch {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [cobrancaId]);

    useEffect(() => {
        if (isOpen) {
            setPage(0);
            setDetailLog(null);
            fetchLogs(0);
        }
    }, [isOpen, fetchLogs]);

    useEffect(() => {
        if (isOpen) fetchLogs(page);
    }, [page]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    };

    const formatJson = (text: string | undefined) => {
        if (!text) return '';
        try {
            return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
            return text;
        }
    };

    if (detailLog) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={() => setDetailLog(null)}
                title="Detalhes do Log de Envio"
                size="xl"
                closeOnOverlayClick
                closeOnEsc
                footer={
                    <button
                        onClick={() => setDetailLog(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Voltar
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-500">Data/Hora:</span>
                            <p>{formatDate(detailLog.dataTentativa)}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500">Status:</span>
                            <p>{detailLog.sucesso
                                ? <span className="text-green-600 font-semibold">Sucesso</span>
                                : <span className="text-red-600 font-semibold">Erro</span>}
                            </p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500">Origem:</span>
                            <p>{origemLabels[detailLog.origem] || detailLog.origem}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-500">Tempo de resposta:</span>
                            <p>{detailLog.tempoRespostaMs != null ? `${detailLog.tempoRespostaMs} ms` : '-'}</p>
                        </div>
                        {detailLog.protocoloSankhya && (
                            <div>
                                <span className="font-semibold text-gray-500">Protocolo:</span>
                                <p>{detailLog.protocoloSankhya}</p>
                            </div>
                        )}
                        {detailLog.codigoErro && (
                            <div>
                                <span className="font-semibold text-gray-500">Código de erro:</span>
                                <p className="text-red-600">{detailLog.codigoErro}</p>
                            </div>
                        )}
                        {detailLog.urlDestino && (
                            <div className="col-span-2">
                                <span className="font-semibold text-gray-500">URL destino:</span>
                                <p className="text-xs break-all text-gray-600">{detailLog.urlDestino}</p>
                            </div>
                        )}
                    </div>

                    {detailLog.mensagemErro && (
                        <div>
                            <span className="font-semibold text-gray-500 text-sm">Mensagem de erro:</span>
                            <pre className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                                {detailLog.mensagemErro}
                            </pre>
                        </div>
                    )}

                    <div>
                        <span className="font-semibold text-gray-500 text-sm">Payload enviado:</span>
                        <pre className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                            {formatJson(detailLog.payloadEnviado)}
                        </pre>
                    </div>

                    {detailLog.respostaRecebida && (
                        <div>
                            <span className="font-semibold text-gray-500 text-sm">Resposta recebida:</span>
                            <pre className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                                {formatJson(detailLog.respostaRecebida)}
                            </pre>
                        </div>
                    )}
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Logs de Envio — Cobrança #${cobrancaId}`}
            size="xl"
            closeOnOverlayClick
            closeOnEsc
            footer={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    Fechar
                </button>
            }
        >
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : logs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum log de envio encontrado.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-gray-500 uppercase">
                                    <th className="pb-2 pr-4">Data/Hora</th>
                                    <th className="pb-2 pr-4">Status</th>
                                    <th className="pb-2 pr-4">Protocolo</th>
                                    <th className="pb-2 pr-4">Origem</th>
                                    <th className="pb-2 pr-4">Tempo</th>
                                    <th className="pb-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2 pr-4 whitespace-nowrap text-xs">{formatDate(log.dataTentativa)}</td>
                                        <td className="py-2 pr-4">
                                            {log.sucesso ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Sucesso
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                                                    <XCircle className="w-3.5 h-3.5" /> Erro
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 pr-4 text-xs">{log.protocoloSankhya || '-'}</td>
                                        <td className="py-2 pr-4 text-xs">{origemLabels[log.origem] || log.origem}</td>
                                        <td className="py-2 pr-4 text-xs">{log.tempoRespostaMs != null ? `${log.tempoRespostaMs} ms` : '-'}</td>
                                        <td className="py-2">
                                            <button
                                                onClick={() => setDetailLog(log)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t mt-3">
                            <span className="text-xs text-gray-500">
                                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} de {totalElements}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page === 0}
                                    className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-gray-700">{page + 1}/{totalPages}</span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};
