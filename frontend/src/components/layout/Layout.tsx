import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building2,
    Users,
    Truck,
    UserSquare,
    Receipt,
    LogOut,
    LayoutDashboard
} from 'lucide-react';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN_TENANT', 'GERENTE', 'OPERADOR', 'VISUALIZADOR'] },
        { to: '/tenants', icon: Building2, label: 'Tenants', roles: ['ADMIN_TENANT'] },
        { to: '/usuarios', icon: Users, label: 'Usuários', roles: ['ADMIN_TENANT', 'GERENTE'] },
        { to: '/transportadores', icon: Truck, label: 'Transportadores', roles: ['GERENTE', 'OPERADOR', 'VISUALIZADOR'] },
        { to: '/tomadores', icon: UserSquare, label: 'Tomadores', roles: ['GERENTE', 'OPERADOR', 'VISUALIZADOR'] },
        { to: '/cobrancas', icon: Receipt, label: 'Cobranças', roles: ['GERENTE', 'OPERADOR', 'VISUALIZADOR'] },
    ];

    return (
        <div className="flex h-screen bg-gray-50 flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
                <div className="p-4 md:p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        CobTransp
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Gestão de Cobranças</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        if (user && item.roles.includes(user.role)) {
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            );
                        }
                        return null;
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <Link to="/perfil" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {user?.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
