import { Bell, User } from 'lucide-react';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';

export default function Header() {
  const { store } = useLojistaAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Olá, Loja {store?.name}
          </h2>
          <p className="text-sm text-gray-500">
            Aqui está o resumo da sua loja hoje.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
