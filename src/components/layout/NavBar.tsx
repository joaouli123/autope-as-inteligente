import React from 'react';
import { Home, Search, ShoppingCart, ClipboardList } from 'lucide-react';
import { ViewState } from '../../types';

interface NavBarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  cartCount: number;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView, cartCount }) => {
  const navItems = [
    { view: ViewState.HOME, icon: Home, label: 'Início' },
    { view: ViewState.SEARCH, icon: Search, label: 'Buscar' },
    { view: ViewState.CART, icon: ShoppingCart, label: 'Carrinho', badge: cartCount },
    { view: ViewState.ORDERS, icon: ClipboardList, label: 'Pedidos' },
  ];

  return (
    // Backdrop blur and bg-white/90 creates the premium "frosted glass" look
    // pb-safe ensures standard safe area, plus extra padding for visual balance
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 transition-all duration-300">
      <div className="flex justify-between items-center w-full md:max-w-[480px] mx-auto h-14">
        {navItems.map((item) => {
          const isActive = item.view === currentView || (item.view === ViewState.HOME && currentView === ViewState.PRODUCT_DETAIL);
          const Icon = item.icon;
          
          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-300 relative group ${
                isActive ? 'text-blue-900 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative p-1">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-colors ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;