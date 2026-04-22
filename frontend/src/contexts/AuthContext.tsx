import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
    id: number;
    tenantId: string;
    nome: string;
    email: string;
    telefone?: string;
    role: 'ADMIN_TENANT' | 'GERENTE' | 'OPERADOR' | 'VISUALIZADOR';
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data) {
                    const userData: User = {
                        id: response.data.id,
                        tenantId: String(response.data.tenantId ?? ''),
                        nome: response.data.nome,
                        email: response.data.email,
                        role: (response.data.role?.replace(/^ROLE_/, '') ?? '') as User['role'],
                    };
                    login(userData);
                }
            } catch (error) {
                console.log("No active session found.");
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token: null, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
