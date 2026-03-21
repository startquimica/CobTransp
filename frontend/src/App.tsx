// App entry point - forced reload
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Layout } from './components/layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Usuarios from './pages/Usuarios';
import Transportadores from './pages/Transportadores';
import Tomadores from './pages/Tomadores';
import Cobrancas from './pages/Cobrancas';
import Perfil from './pages/Perfil';

import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { ConfirmModal } from './components/common/ConfirmModal';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <ConfirmModal />
            <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="tenants" element={<RequireAuth roles={['ADMIN_TENANT']}><Tenants /></RequireAuth>} />
              <Route path="usuarios" element={<RequireAuth roles={['ADMIN_TENANT', 'GERENTE']}><Usuarios /></RequireAuth>} />
              <Route path="transportadores" element={<RequireAuth roles={['GERENTE', 'OPERADOR', 'VISUALIZADOR']}><Transportadores /></RequireAuth>} />
              <Route path="tomadores" element={<RequireAuth roles={['GERENTE', 'OPERADOR', 'VISUALIZADOR']}><Tomadores /></RequireAuth>} />
              <Route path="cobrancas" element={<RequireAuth roles={['GERENTE', 'OPERADOR', 'VISUALIZADOR']}><Cobrancas /></RequireAuth>} />
              <Route path="perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
