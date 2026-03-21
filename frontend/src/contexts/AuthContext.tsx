import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: number;
    tenantId?: number;
    nome: string;
    email: string;
    role: 'ADMIN_TENANT' | 'GERENTE' | 'OPERADOR' | 'VISUALIZADOR';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    const handleLogin = (jwtToken: string) => {
        try {
            const decoded: any = jwtDecode(jwtToken);
            const userData: User = {
                id: decoded.id,
                tenantId: decoded.tenantId,
                nome: decoded.nome,
                email: decoded.sub,
                role: decoded.role,
            };

            setUser(userData);
            setToken(jwtToken);
            setIsAuthenticated(true);
            localStorage.setItem('token', jwtToken);
        } catch (e) {
            console.error("Token inválido", e);
            handleLogout();
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            handleLogin(storedToken);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login: handleLogin, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
