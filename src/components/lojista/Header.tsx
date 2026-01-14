import { Bell, User } from 'lucide-react';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';

export default function Header() {
  const { store } = useLojistaAuth();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-5 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Olá, {store?.name || 'Loja'} 👋
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Aqui está o resumo da sua loja hoje
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105">
            <Bell size={22} className="text-gray-600" strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <User size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">{store?.name}</p>
              <p className="text-xs text-gray-500">Lojista</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
