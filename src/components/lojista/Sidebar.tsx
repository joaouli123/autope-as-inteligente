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
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AutoPeças Pro</h1>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{store?.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} strokeWidth={2} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 hover:translate-x-1"
        >
          <LogOut size={20} strokeWidth={2} />
          <span className="font-semibold text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
}
