import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { useConfirmState } from '../../contexts/ConfirmContext';

export const ConfirmModal: React.FC = () => {
    const { state, handleConfirm, handleCancel } = useConfirmState();

    if (!state?.open) return null;

    const isDanger = state.variant === 'danger';
    const title = state.title ?? (isDanger ? 'Confirmar exclusão' : 'Confirmar ação');
    const confirmLabel = state.confirmLabel ?? (isDanger ? 'Excluir' : 'Confirmar');
    const cancelLabel = state.cancelLabel ?? 'Cancelar';

    return (
        <Modal
            isOpen
            onClose={handleCancel}
            title={title}
            size="sm"
            closeOnOverlayClick
            closeOnEsc
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            }
        >
            <div className="flex gap-3 items-start p-1">
                {isDanger
                    ? <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    : <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                }
                <p className="text-sm text-gray-700">{state.message}</p>
            </div>
        </Modal>
    );
};
