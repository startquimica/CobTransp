import React, { createContext, useContext, useRef, useState } from 'react';

export type ConfirmVariant = 'danger' | 'primary';

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
    open: boolean;
    resolve: (value: boolean) => void;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    state: ConfirmState | null;
    handleConfirm: () => void;
    handleCancel: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ConfirmState | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setState({ ...options, open: true, resolve });
        });
    };

    const handleConfirm = () => {
        resolveRef.current?.(true);
        setState(null);
    };

    const handleCancel = () => {
        resolveRef.current?.(false);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm, state, handleConfirm, handleCancel }}>
            {children}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
    return context.confirm;
};

export const useConfirmState = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirmState must be used within a ConfirmProvider');
    return { state: context.state, handleConfirm: context.handleConfirm, handleCancel: context.handleCancel };
};
