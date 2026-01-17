import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader, AlertCircle } from 'lucide-react';
import { getBrands, getModels, getYears, type FipeItem, type FipeYear } from '../../services/fipeService';

export interface VehicleCompatibility {
  brand: string;
  brandId: string;
  model: string;
  modelId: string;
  year: number; // Single model year instead of start/end range
  engines: string[];
  transmissions: string[];
  fuel_types: string[];
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
  const [errorLoadingBrands, setErrorLoadingBrands] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    setErrorLoadingBrands(false);
    try {
      const data = await getBrands('carros');
      if (data && data.length > 0) {
        setBrands(data);
      } else {
        console.error('FIPE API: No brands returned for vehicle type "carros"');
        setErrorLoadingBrands(true);
      }
    } catch (error) {
      console.error('FIPE API: Error fetching brands for vehicle type "carros":', error);
      setErrorLoadingBrands(true);
    } finally {
      setLoadingBrands(false);
    }
  };

  const addCompatibility = () => {
    onChange([
      ...compatibilities,
      {
        brand: '',
        brandId: '',
        model: '',
        modelId: '',
        year: new Date().getFullYear(), // Default to current year
        engines: [],
        transmissions: [],
        fuel_types: [],
      },
    ]);
  };

  const removeCompatibility = (index: number) => {
    onChange(compatibilities.filter((_, i) => i !== index));
  };

  const updateCompatibility = (index: number, field: keyof VehicleCompatibility, value: string | number | string[] | undefined) => {
    const updated = [...compatibilities];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">🚗 Compatibilidade com Veículos</h3>
        <p className="text-sm text-gray-600">
          Adicione os veículos compatíveis com este produto usando dados da FIPE
        </p>
      </div>

      {errorLoadingBrands && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800">API FIPE Temporariamente Indisponível</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Não foi possível carregar as marcas da API FIPE. Você pode adicionar compatibilidades manualmente 
              digitando os nomes de marca e modelo, ou tentar novamente mais tarde.
            </p>
            <button
              type="button"
              onClick={fetchBrands}
              className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline font-medium"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {compatibilities.map((comp, index) => (
          <VehicleCompatibilityRow
            key={index}
            compatibility={comp}
            index={index}
            brands={brands}
            loadingBrands={loadingBrands}
            errorLoadingBrands={errorLoadingBrands}
            onUpdate={updateCompatibility}
            onRemove={() => removeCompatibility(index)}
          />
        ))}
        
        {/* Always show add button for flexibility */}
        <button
          type="button"
          onClick={addCompatibility}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Adicionar Outro Veículo
        </button>
      </div>
    </div>
  );
}

interface VehicleCompatibilityRowProps {
  compatibility: VehicleCompatibility;
  index: number;
  brands: FipeItem[];
  loadingBrands: boolean;
  errorLoadingBrands: boolean;
  onUpdate: (index: number, field: keyof VehicleCompatibility, value: any) => void;
  onRemove: () => void;
}

function VehicleCompatibilityRow({
  compatibility,
  index,
  brands,
  loadingBrands,
  errorLoadingBrands,
  onUpdate,
  onRemove,
}: VehicleCompatibilityRowProps) {
  const [models, setModels] = useState<FipeItem[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [errorLoadingModels, setErrorLoadingModels] = useState(false);
  const [manualEntry, setManualEntry] = useState(errorLoadingBrands);

  useEffect(() => {
    if (compatibility.brandId && !manualEntry) {
      fetchModels(compatibility.brandId);
    }
  }, [compatibility.brandId, manualEntry]);

  const fetchModels = async (brandId: string) => {
    setLoadingModels(true);
    setErrorLoadingModels(false);
    try {
      const data = await getModels('carros', brandId);
      if (data && data.length > 0) {
        setModels(data);
      } else {
        console.error(`FIPE API: No models returned for brand ID "${brandId}"`);
        setErrorLoadingModels(true);
        setManualEntry(true);
      }
    } catch (error) {
      console.error(`FIPE API: Error fetching models for brand ID "${brandId}":`, error);
      setErrorLoadingModels(true);
      setManualEntry(true);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchYearsForModel = async (brandId: string, modelId: string) => {
    setLoadingYears(true);
    try {
      const data = await getYears('carros', brandId, modelId);
      setYears(data);
    } catch (error) {
      console.error(`FIPE API: Error fetching years for brand ID "${brandId}", model ID "${modelId}":`, error);
    } finally {
      setLoadingYears(false);
    }
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

  const handleManualBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, 'brand', e.target.value);
    onUpdate(index, 'brandId', '');
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModel = models.find((m) => m.codigo === e.target.value);
    if (selectedModel) {
      onUpdate(index, 'modelId', selectedModel.codigo);
      onUpdate(index, 'model', selectedModel.nome);
      fetchYearsForModel(compatibility.brandId, selectedModel.codigo);
    }
  };

  const handleManualModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, 'model', e.target.value);
    onUpdate(index, 'modelId', '');
  };

  // Generate years from 1950 to 2026
  const generateYears = () => {
    const currentYear = 2026;
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h4 className="text-md font-semibold text-gray-900">Veículo #{index + 1}</h4>
        <div className="flex items-center gap-2">
          {!errorLoadingBrands && (
            <button
              type="button"
              onClick={() => setManualEntry(!manualEntry)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {manualEntry ? 'Usar FIPE API' : 'Entrada Manual'}
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 p-1"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          {manualEntry ? (
            <input
              type="text"
              value={compatibility.brand}
              onChange={handleManualBrandChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a marca (ex: Chevrolet)"
            />
          ) : (
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
          )}
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
          {manualEntry ? (
            <input
              type="text"
              value={compatibility.model}
              onChange={handleManualModelChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o modelo (ex: Onix)"
            />
          ) : (
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
          )}
          {loadingModels && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader size={16} className="animate-spin" />
              Carregando modelos...
            </div>
          )}
          {errorLoadingModels && !manualEntry && (
            <p className="text-xs text-yellow-600 mt-1">
              Erro ao carregar modelos. Tente entrada manual.
            </p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano do Modelo *
          </label>
          <select
            value={compatibility.year}
            onChange={(e) => onUpdate(index, 'year', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione o ano</option>
            {generateYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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
          <p className="text-xs text-gray-500 mt-1">
            Cilindradas compatíveis
          </p>
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
      </div>
    </div>
  );
}
