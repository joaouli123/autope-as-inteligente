import { X, Filter } from 'lucide-react';

interface FilterChipsProps {
  activeFilters: {
    category?: string;
    useMyVehicle?: boolean;
    sortOrder?: string;
    attributes?: Record<string, string>;
  };
  onRemoveCategory: () => void;
  onRemoveAttribute: (key: string) => void;
  onOpenFilterModal: () => void;
  onToggleVehicleFilter?: () => void;
}

export default function FilterChips({
  activeFilters,
  onRemoveCategory,
  onRemoveAttribute,
  onOpenFilterModal,
  onToggleVehicleFilter,
}: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {/* Filter Button */}
      <button
        onClick={onOpenFilterModal}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors"
      >
        <Filter size={14} />
        <span>Filtros</span>
      </button>

      {/* Category Chip */}
      {activeFilters.category && (
        <button
          onClick={onRemoveCategory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-medium whitespace-nowrap"
        >
          <span>{activeFilters.category}</span>
          <X size={12} />
        </button>
      )}

      {/* Attribute Chips */}
      {activeFilters.attributes &&
        Object.entries(activeFilters.attributes).map(([key, value]) => {
          if (!value) return null;
          return (
            <button
              key={key}
              onClick={() => onRemoveAttribute(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-900 rounded-lg text-xs font-medium whitespace-nowrap border border-blue-200"
            >
              <span>{value}</span>
              <X size={12} />
            </button>
          );
        })}

      {/* My Vehicle Indicator */}
      {activeFilters.useMyVehicle && (
        <button
          onClick={onToggleVehicleFilter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium whitespace-nowrap border border-green-200 hover:bg-green-100 transition-colors"
        >
          <span>✓ Meu Veículo</span>
          {onToggleVehicleFilter && <X size={12} />}
        </button>
      )}
    </div>
  );
}
