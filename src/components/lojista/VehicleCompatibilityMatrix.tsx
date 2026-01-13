import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { getBrands, getModels, getYears, type FipeItem, type FipeYear } from '../../services/fipeService';

export interface VehicleCompatibility {
  brand: string;
  brandId: string;
  model: string;
  modelId: string;
  year_start: number;
  year_end?: number;
  engines: string[];
  transmissions: string[];
  fuel_types: string[];
  notes?: string;
}

interface VehicleCompatibilityMatrixProps {
  compatibilities: VehicleCompatibility[];
  onChange: (compatibilities: VehicleCompatibility[]) => void;
}

export default function VehicleCompatibilityMatrix({
  compatibilities,
  onChange,
}: VehicleCompatibilityMatrixProps) {
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    const data = await getBrands('carros');
    setBrands(data);
    setLoadingBrands(false);
  };

  const addCompatibility = () => {
    onChange([
      ...compatibilities,
      {
        brand: '',
        brandId: '',
        model: '',
        modelId: '',
        year_start: new Date().getFullYear() - 10,
        year_end: new Date().getFullYear(),
        engines: [],
        transmissions: [],
        fuel_types: [],
        notes: '',
      },
    ]);
  };

  const removeCompatibility = (index: number) => {
    onChange(compatibilities.filter((_, i) => i !== index));
  };

  const updateCompatibility = (index: number, field: keyof VehicleCompatibility, value: any) => {
    const updated = [...compatibilities];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Compatibilidade com Veículos</h3>
          <p className="text-sm text-gray-600">
            Adicione os veículos compatíveis com este produto
          </p>
        </div>
        <button
          type="button"
          onClick={addCompatibility}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Adicionar Veículo
        </button>
      </div>

      {compatibilities.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            Nenhum veículo compatível adicionado. Clique em "Adicionar Veículo" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {compatibilities.map((comp, index) => (
            <VehicleCompatibilityRow
              key={index}
              compatibility={comp}
              index={index}
              brands={brands}
              loadingBrands={loadingBrands}
              onUpdate={updateCompatibility}
              onRemove={() => removeCompatibility(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface VehicleCompatibilityRowProps {
  compatibility: VehicleCompatibility;
  index: number;
  brands: FipeItem[];
  loadingBrands: boolean;
  onUpdate: (index: number, field: keyof VehicleCompatibility, value: any) => void;
  onRemove: () => void;
}

function VehicleCompatibilityRow({
  compatibility,
  index,
  brands,
  loadingBrands,
  onUpdate,
  onRemove,
}: VehicleCompatibilityRowProps) {
  const [models, setModels] = useState<FipeItem[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    if (compatibility.brandId) {
      fetchModels(compatibility.brandId);
    }
  }, [compatibility.brandId]);

  const fetchModels = async (brandId: string) => {
    setLoadingModels(true);
    const data = await getModels('carros', brandId);
    setModels(data);
    setLoadingModels(false);
  };

  const fetchYearsForModel = async (brandId: string, modelId: string) => {
    setLoadingYears(true);
    const data = await getYears('carros', brandId, modelId);
    setYears(data);
    setLoadingYears(false);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBrand = brands.find((b) => b.codigo === e.target.value);
    if (selectedBrand) {
      onUpdate(index, 'brandId', selectedBrand.codigo);
      onUpdate(index, 'brand', selectedBrand.nome);
      onUpdate(index, 'model', '');
      onUpdate(index, 'modelId', '');
      setModels([]);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModel = models.find((m) => m.codigo === e.target.value);
    if (selectedModel) {
      onUpdate(index, 'modelId', selectedModel.codigo);
      onUpdate(index, 'model', selectedModel.nome);
      fetchYearsForModel(compatibility.brandId, selectedModel.codigo);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h4 className="text-md font-semibold text-gray-900">Veículo #{index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <select
            value={compatibility.brandId}
            onChange={handleBrandChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingBrands}
          >
            <option value="">Selecione a marca</option>
            {brands.map((brand) => (
              <option key={brand.codigo} value={brand.codigo}>
                {brand.nome}
              </option>
            ))}
          </select>
          {loadingBrands && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader size={16} className="animate-spin" />
              Carregando marcas...
            </div>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <select
            value={compatibility.modelId}
            onChange={handleModelChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!compatibility.brandId || loadingModels}
          >
            <option value="">Selecione o modelo</option>
            {models.map((model) => (
              <option key={model.codigo} value={model.codigo}>
                {model.nome}
              </option>
            ))}
          </select>
          {loadingModels && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader size={16} className="animate-spin" />
              Carregando modelos...
            </div>
          )}
        </div>

        {/* Year Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano Inicial *
          </label>
          <input
            type="number"
            value={compatibility.year_start}
            onChange={(e) => onUpdate(index, 'year_start', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1950"
            max={new Date().getFullYear() + 1}
          />
        </div>

        {/* Year End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano Final (opcional)
          </label>
          <input
            type="number"
            value={compatibility.year_end || ''}
            onChange={(e) => onUpdate(index, 'year_end', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={compatibility.year_start}
            max={new Date().getFullYear() + 1}
            placeholder="Deixe vazio para atual"
          />
        </div>

        {/* Engines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motores (separados por vírgula)
          </label>
          <input
            type="text"
            value={compatibility.engines.join(', ')}
            onChange={(e) =>
              onUpdate(
                index,
                'engines',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 1.0, 1.4, 1.6"
          />
        </div>

        {/* Transmissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmissões (separadas por vírgula)
          </label>
          <input
            type="text"
            value={compatibility.transmissions.join(', ')}
            onChange={(e) =>
              onUpdate(
                index,
                'transmissions',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Manual, Automática, CVT"
          />
        </div>

        {/* Fuel Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Combustíveis (separados por vírgula)
          </label>
          <input
            type="text"
            value={compatibility.fuel_types.join(', ')}
            onChange={(e) =>
              onUpdate(
                index,
                'fuel_types',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Gasolina, Flex, Diesel"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <input
            type="text"
            value={compatibility.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informações adicionais sobre compatibilidade"
          />
        </div>
      </div>
    </div>
  );
}
