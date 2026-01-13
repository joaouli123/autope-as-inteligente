import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  LogOut,
} from 'lucide-react';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';

const navigation = [
  { name: 'Visão Geral', href: '/lojista/dashboard', icon: LayoutDashboard },
  { name: 'Produtos', href: '/lojista/produtos', icon: Package },
  { name: 'Pedidos', href: '/lojista/pedidos', icon: ShoppingCart },
  { name: 'Clientes', href: '/lojista/clientes', icon: Users },
  { name: 'Minha Loja', href: '/lojista/perfil', icon: Store },
];

export default function Sidebar() {
  const location = useLocation();
  const { store, logout } = useLojistaAuth();

  return (
    <div className="w-64 bg-[#1e293b] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AutoPeças Pro</h1>
            <p className="text-sm text-gray-400 truncate">{store?.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
