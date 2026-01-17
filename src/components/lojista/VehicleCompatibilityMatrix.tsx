import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
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

// Lista de marcas de fallback caso a API FIPE esteja indisponível
const FALLBACK_BRANDS: FipeItem[] = [
  { codigo: '1', nome: 'Acura' },
  { codigo: '2', nome: 'Agrale' },
  { codigo: '3', nome: 'Alfa Romeo' },
  { codigo: '4', nome: 'AM Gen' },
  { codigo: '5', nome: 'Asia Motors' },
  { codigo: '6', nome: 'ASTON MARTIN' },
  { codigo: '7', nome: 'Audi' },
  { codigo: '8', nome: 'BMW' },
  { codigo: '9', nome: 'BRM' },
  { codigo: '10', nome: 'Buggy' },
  { codigo: '11', nome: 'Bugre' },
  { codigo: '12', nome: 'Buick' },
  { codigo: '13', nome: 'Cadillac' },
  { codigo: '14', nome: 'CBT Jipe' },
  { codigo: '15', nome: 'CHANA' },
  { codigo: '16', nome: 'CHANGAN' },
  { codigo: '17', nome: 'CHERY' },
  { codigo: '18', nome: 'Chevrolet' },
  { codigo: '19', nome: 'Chrysler' },
  { codigo: '20', nome: 'Citroën' },
  { codigo: '21', nome: 'Cross Lander' },
  { codigo: '22', nome: 'Daewoo' },
  { codigo: '23', nome: 'Daihatsu' },
  { codigo: '24', nome: 'Dodge' },
  { codigo: '25', nome: 'EFFA' },
  { codigo: '26', nome: 'Engesa' },
  { codigo: '27', nome: 'Envemo' },
  { codigo: '28', nome: 'Ferrari' },
  { codigo: '29', nome: 'Fiat' },
  { codigo: '30', nome: 'Fibravan' },
  { codigo: '31', nome: 'Ford' },
  { codigo: '32', nome: 'FOTON' },
  { codigo: '33', nome: 'Fyber' },
  { codigo: '34', nome: 'GEELY' },
  { codigo: '35', nome: 'GM - Chevrolet' },
  { codigo: '36', nome: 'GREAT WALL' },
  { codigo: '37', nome: 'Gurgel' },
  { codigo: '38', nome: 'HAFEI' },
  { codigo: '39', nome: 'Honda' },
  { codigo: '40', nome: 'Hyundai' },
  { codigo: '41', nome: 'Isuzu' },
  { codigo: '42', nome: 'IVECO' },
  { codigo: '43', nome: 'JAC' },
  { codigo: '44', nome: 'Jaguar' },
  { codigo: '45', nome: 'Jeep' },
  { codigo: '46', nome: 'JINBEI' },
  { codigo: '47', nome: 'JPX' },
  { codigo: '48', nome: 'Kia Motors' },
  { codigo: '49', nome: 'Lada' },
  { codigo: '50', nome: 'Lamborghini' },
  { codigo: '51', nome: 'Land Rover' },
  { codigo: '52', nome: 'Lexus' },
  { codigo: '53', nome: 'LIFAN' },
  { codigo: '54', nome: 'Lobini' },
  { codigo: '55', nome: 'Lotus' },
  { codigo: '56', nome: 'Mahindra' },
  { codigo: '57', nome: 'Maserati' },
  { codigo: '58', nome: 'Matra' },
  { codigo: '59', nome: 'Mazda' },
  { codigo: '60', nome: 'Mercedes-Benz' },
  { codigo: '61', nome: 'Mercury' },
  { codigo: '62', nome: 'MG' },
  { codigo: '63', nome: 'MINI' },
  { codigo: '64', nome: 'Mitsubishi' },
  { codigo: '65', nome: 'Miura' },
  { codigo: '66', nome: 'Nissan' },
  { codigo: '67', nome: 'Peugeot' },
  { codigo: '68', nome: 'Plymouth' },
  { codigo: '69', nome: 'Pontiac' },
  { codigo: '70', nome: 'Porsche' },
  { codigo: '71', nome: 'RAM' },
  { codigo: '72', nome: 'RELY' },
  { codigo: '73', nome: 'Renault' },
  { codigo: '74', nome: 'Rolls-Royce' },
  { codigo: '75', nome: 'Rover' },
  { codigo: '76', nome: 'Saab' },
  { codigo: '77', nome: 'Saturn' },
  { codigo: '78', nome: 'Seat' },
  { codigo: '79', nome: 'SHINERAY' },
  { codigo: '80', nome: 'smart' },
  { codigo: '81', nome: 'SSANGYONG' },
  { codigo: '82', nome: 'Subaru' },
  { codigo: '83', nome: 'Suzuki' },
  { codigo: '84', nome: 'TAC' },
  { codigo: '85', nome: 'Toyota' },
  { codigo: '86', nome: 'Troller' },
  { codigo: '87', nome: 'Volkswagen' },
  { codigo: '88', nome: 'Volvo' },
  { codigo: '89', nome: 'Wake' },
  { codigo: '90', nome: 'Walk' },
];

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
    try {
      console.log('Fetching brands from FIPE API...');
      const data = await getBrands('carros');
      console.log('FIPE API response:', data);
      if (data && Array.isArray(data) && data.length > 0) {
        setBrands(data);
        console.log(`Loaded ${data.length} brands successfully`);
      } else {
        console.log('FIPE API returned no data, using fallback brands');
        setBrands(FALLBACK_BRANDS);
      }
    } catch (error) {
      console.error('FIPE API: Error fetching brands, using fallback:', error);
      setBrands(FALLBACK_BRANDS);
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
        <h3 className="text-lg font-semibold text-gray-900">Veículo Compatível</h3>
        <p className="text-sm text-gray-600">
          Informe o veículo específico para o qual esta peça se destina
        </p>
      </div>

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
    try {
      const data = await getModels('carros', brandId);
      if (data && data.length > 0) {
        setModels(data);
      } else {
        console.error(`FIPE API: No models returned for brand ID "${brandId}"`);
      }
    } catch (error) {
      console.error(`FIPE API: Error fetching models for brand ID "${brandId}":`, error);
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
    const value = e.target.value;
    const selectedBrand = brands.find((b) => b.codigo === value);
    if (selectedBrand) {
      onUpdate(index, 'brandId', selectedBrand.codigo);
      onUpdate(index, 'brand', selectedBrand.nome);
      // Reset model when brand changes
      onUpdate(index, 'model', '');
      onUpdate(index, 'modelId', '');
      setModels([]);
    } else if (value === '') {
      onUpdate(index, 'brandId', '');
      onUpdate(index, 'brand', '');
      onUpdate(index, 'model', '');
      onUpdate(index, 'modelId', '');
      setModels([]);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedModel = models.find((m) => m.codigo === value);
    if (selectedModel) {
      onUpdate(index, 'modelId', selectedModel.codigo);
      onUpdate(index, 'model', selectedModel.nome);
      fetchYearsForModel(compatibility.brandId, selectedModel.codigo);
    } else if (value === '') {
      onUpdate(index, 'modelId', '');
      onUpdate(index, 'model', '');
    }
  };

  // Generate years from 1950 to current year
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">

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
            Motores
          </label>
          <select
            value={compatibility.engines[0] || ''}
            onChange={(e) => onUpdate(index, 'engines', e.target.value ? [e.target.value] : [])}
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
          <p className="text-xs text-gray-500 mt-1">
            Cilindrada do motor
          </p>
        </div>

        {/* Transmissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmissão
          </label>
          <select
            value={compatibility.transmissions[0] || ''}
            onChange={(e) => onUpdate(index, 'transmissions', e.target.value ? [e.target.value] : [])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione a transmissão</option>
            <option value="Manual">Manual</option>
            <option value="Automática">Automática</option>
            <option value="CVT">CVT</option>
            <option value="Automatizada">Automatizada</option>
          </select>
        </div>

        {/* Fuel Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Combustível
          </label>
          <select
            value={compatibility.fuel_types[0] || ''}
            onChange={(e) => onUpdate(index, 'fuel_types', e.target.value ? [e.target.value] : [])}
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
  );
}
