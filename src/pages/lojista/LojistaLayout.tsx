import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';
import Sidebar from '../../components/lojista/Sidebar';
import Header from '../../components/lojista/Header';

export default function LojistaLayout() {
  const { isAuthenticated, loading } = useLojistaAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/lojista/login') {
      navigate('/lojista/login');
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (location.pathname === '/lojista/login') {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
