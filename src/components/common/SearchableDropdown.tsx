import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { FipeItem } from '../../services/fipeService';

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  options: FipeItem[];
  value: string; 
  onSelect: (item: FipeItem) => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ 
  label, placeholder, options, value, onSelect, isLoading, disabled, icon 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt => opt.nome.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <div 
        className={`relative flex items-center bg-gray-50 border rounded-xl transition-all touch-manipulation ${
          isOpen ? 'ring-2 ring-blue-900 border-blue-900 bg-white' : 'border-gray-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {icon && <div className="pl-4 text-gray-400">{icon}</div>}
        
        <input 
          type="text"
          className={`w-full bg-transparent py-3.5 pl-3 pr-10 text-gray-900 focus:outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          value={isOpen ? search : value} 
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); 
          }}
          disabled={disabled}
        />
        
        <div className="absolute right-4 text-gray-400 pointer-events-none">
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto no-scrollbar animate-[fadeIn_0.1s_ease-out]">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt.codigo}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors active:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(opt);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {opt.nome}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">
              Nenhum resultado encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
