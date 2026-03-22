import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { KeyRound } from 'lucide-react';

export default function Perfil() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erroLocal, setErroLocal] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroLocal('');

        if (novaSenha !== confirmarSenha) {
            setErroLocal('A nova senha e a confirmação não coincidem.');
            return;
        }
        if (novaSenha.length < 6) {
            setErroLocal('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.patch('/usuarios/me/senha', { senhaAtual, novaSenha });
            showToast('Senha alterada com sucesso!', 'success');
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Erro ao alterar senha.';
            setErroLocal(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Perfil</h1>

            {/* Info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {user?.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-lg">{user?.nome}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Change password card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 mb-5">
                    <KeyRound className="w-4 h-4" />
                    Alterar Senha
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Senha Atual
                        </label>
                        <input
                            type="password"
                            value={senhaAtual}
                            onChange={e => setSenhaAtual(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            value={novaSenha}
                            onChange={e => setNovaSenha(e.target.value)}
                            required
                            minLength={6}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirmar Nova Senha
                        </label>
                        <input
                            type="password"
                            value={confirmarSenha}
                            onChange={e => setConfirmarSenha(e.target.value)}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {erroLocal && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {erroLocal}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        {loading ? 'Salvando...' : 'Alterar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
