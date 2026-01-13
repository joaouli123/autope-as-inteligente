import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LojistaAuthProvider } from './contexts/LojistaAuthContext';
import App from './App';
import LojistaLayout from './pages/lojista/LojistaLayout';
import LoginPage from './pages/lojista/LoginPage';
import SignupPage from './pages/lojista/SignupPage';
import DashboardPage from './pages/lojista/DashboardPage';
import ProdutosPage from './pages/lojista/ProdutosPage';
import NovoProdutoPage from './pages/lojista/NovoProdutoPage';
import PedidosPage from './pages/lojista/PedidosPage';
import ClientesPage from './pages/lojista/ClientesPage';
import PerfilPage from './pages/lojista/PerfilPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Consumer App (existing) */}
        <Route path="/" element={<App />} />
        
        {/* Lojista (Store Owner) Routes */}
        <Route
          path="/lojista/*"
          element={
            <LojistaAuthProvider>
              <Routes>
                <Route element={<LojistaLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="cadastro" element={<SignupPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="produtos" element={<ProdutosPage />} />
                  <Route path="produtos/novo" element={<NovoProdutoPage />} />
                  <Route path="produtos/:id" element={<NovoProdutoPage />} />
                  <Route path="pedidos" element={<PedidosPage />} />
                  <Route path="pedidos/:id" element={<PedidosPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="perfil" element={<PerfilPage />} />
                  <Route index element={<Navigate to="/lojista/login" replace />} />
                </Route>
              </Routes>
            </LojistaAuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
