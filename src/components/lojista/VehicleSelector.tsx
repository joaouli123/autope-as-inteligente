import { useEffect, useMemo, useState } from 'react';
import { Loader } from 'lucide-react';
import {
  getBrands,
  getModels,
  type FipeItem,
} from '../../services/fipeService';

export interface VehicleSelection {
  brand: string;
  brandId: string;
  model: string;
  modelId: string;
  year: number;
  engines: string[];
  transmissions: string[];
  fuel_types: string[];
  valves: number | null;
}

interface VehicleSelectorProps {
  value: VehicleSelection;
  onChange: (value: VehicleSelection) => void;
}

export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [brandsError, setBrandsError] = useState<string>('');
  const [modelsError, setModelsError] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

    (async () => {
      setLoadingBrands(true);
      setBrandsError('');
      try {
        const data = await getBrands('carros', controller.signal);
        if (!data.length) {
          setBrands([]);
          setBrandsError('Não foi possível carregar marcas agora.');
          return;
        }
        setBrands(data);
      } catch (err) {
        setBrands([]);
        setBrandsError('Não foi possível carregar marcas agora.');
      } finally {
        window.clearTimeout(timeoutId);
        setLoadingBrands(false);
      }
    })();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (value.brandId || !value.brand || brands.length === 0) return;

    const normalized = value.brand.trim().toLowerCase();
    const match = brands.find((b) => b.nome.trim().toLowerCase() === normalized);
    if (!match) return;

    onChange({
      ...value,
      brandId: String(match.codigo),
      brand: match.nome,
    });
  }, [brands, onChange, value]);

  useEffect(() => {
    // reset dependent fields when brand changes
    setModels([]);
    setModelsError('');

    if (!value.brandId) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

    (async () => {
      setLoadingModels(true);
      try {
        const data = await getModels('carros', value.brandId, controller.signal);
        setModels(data);
        if (!data.length) {
          setModelsError('Nenhum modelo foi carregado para esta marca.');
        }
      } catch (err) {
        setModels([]);
        setModelsError('Não foi possível carregar modelos agora.');
      } finally {
        window.clearTimeout(timeoutId);
        setLoadingModels(false);
      }
    })();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [value.brandId]);

  useEffect(() => {
    if (!value.brandId || value.modelId || !value.model || models.length === 0) return;

    const normalized = value.model.trim().toLowerCase();
    const match = models.find((m) => m.nome.trim().toLowerCase() === normalized);
    if (!match) return;

    onChange({
      ...value,
      modelId: String(match.codigo),
      model: match.nome,
    });
  }, [models, onChange, value]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result: { label: string; value: string }[] = [];
    for (let y = currentYear; y >= 1950; y--) {
      result.push({ label: String(y), value: String(y) });
    }
    return result;
  }, []);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const brandName = (selectedOption?.textContent || '').trim();

    if (!brandId) {
      onChange({
        ...value,
        brandId: '',
        brand: '',
        modelId: '',
        model: '',
      });
      return;
    }

    onChange({
      ...value,
      brandId,
      brand: brandName,
      modelId: '',
      model: '',
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const modelName = (selectedOption?.textContent || '').trim();

    if (!modelId) {
      onChange({ ...value, modelId: '', model: '' });
      return;
    }

    onChange({ ...value, modelId, model: modelName });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Veículo Compatível</h3>
        <p className="text-sm text-gray-600">
          Informe o veículo específico para o qual esta peça se destina
        </p>
      </div>

      {brandsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">{brandsError}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
            <select
              value={value.brandId}
              onChange={handleBrandChange}
              disabled={loadingBrands || brands.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione a marca</option>
              {brands.map((b) => (
                <option key={String(b.codigo)} value={String(b.codigo)}>
                  {b.nome}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo *
            </label>
            <select
              value={value.modelId}
              onChange={handleModelChange}
              disabled={!value.brandId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione o modelo</option>
              {loadingModels && (
                <option value="" disabled>
                  Carregando modelos...
                </option>
              )}
              {models.map((m) => (
                <option key={String(m.codigo)} value={String(m.codigo)}>
                  {m.nome}
                </option>
              ))}
            </select>
            {!value.brandId && (
              <p className="text-xs text-gray-500 mt-2">
                Selecione uma marca para carregar os modelos.
              </p>
            )}
            {!!modelsError && value.brandId && !loadingModels && (
              <p className="text-xs text-gray-500 mt-2">{modelsError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano do Modelo *
            </label>
            <select
              value={String(value.year)}
              onChange={(e) =>
                onChange({ ...value, year: parseInt(e.target.value, 10) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motores
            </label>
            <select
              value={value.engines[0] || ''}
              onChange={(e) =>
                onChange({ ...value, engines: e.target.value ? [e.target.value] : [] })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o motor</option>
              <option value="1.0">1.0</option>
              <option value="1.3">1.3</option>
              <option value="1.4">1.4</option>
              <option value="1.5">1.5</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2.0">2.0</option>
              <option value="2.4">2.4</option>
              <option value="3.0">3.0</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Cilindrada do motor</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transmissão
            </label>
            <select
              value={value.transmissions[0] || ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  transmissions: e.target.value ? [e.target.value] : [],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione a transmissão</option>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
              <option value="CVT">CVT</option>
              <option value="Automatizada">Automatizada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Válvulas
            </label>
            <select
              value={value.valves !== null ? String(value.valves) : ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  valves: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione as válvulas</option>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="32">32</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Combustível
            </label>
            <select
              value={value.fuel_types[0] || ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  fuel_types: e.target.value ? [e.target.value] : [],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o combustível</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="Flex">Flex (Gasolina/Etanol)</option>
              <option value="Diesel">Diesel</option>
              <option value="GNV">GNV</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
