import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
    children?: React.ReactNode;
    roles?: string[];
    redirectTo?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles, redirectTo = '/' }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
