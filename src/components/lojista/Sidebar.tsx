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
    <div className="w-64 bg-gradient-to-b from-[#1f4461] via-[#1a3a52] to-[#1f4461] text-white flex flex-col shadow-2xl border-r border-[#34abd5]/10">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#34abd5] to-[#e99950] rounded-xl flex items-center justify-center shadow-lg">
            <Store size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AutoPeças Pro</h1>
            <p className="text-xs text-[#34abd5]/80 truncate max-w-[150px] font-medium">{store?.name}</p>
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
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 $
                isActive
                  ? 'bg-gradient-to-r from-[#34abd5] to-[#34abd5]/80 text-white shadow-lg shadow-[#34abd5]/20 scale-[1.02]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} strokeWidth={2.2} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 hover:translate-x-1"
        >
          <LogOut size={20} strokeWidth={2.2} />
          <span className="font-semibold text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
}
