import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUpload from '../../components/lojista/ImageUpload';
import VehicleCompatibilityMatrix, {
  type VehicleCompatibility,
} from '../../components/lojista/VehicleCompatibilityMatrix';
import { supabase } from '../../services/supabaseClient';
import type { Product } from '../../types/lojista';

interface FormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  oem_codes: string;
  mpn: string;
  brand: string;
  model: string;
  price: string;
  stock_quantity: string;
  images: string[];
  specifications: { key: string; value: string }[];
  compatible_vehicles: string[];
  vehicle_compatibilities: VehicleCompatibility[];
  is_active: boolean;
}

const categories = [
  'Freios',
  'Motor',
  'Suspensão',
  'Elétrica',
  'Transmissão',
  'Filtros',
  'Óleo e Fluidos',
  'Pneus',
  'Bateria',
  'Acessórios',
];

// Category-specific specification templates
const categorySpecifications: Record<string, string[]> = {
  Freios: ['tipo', 'posição', 'material', 'dimensões', 'espessura'],
  Suspensão: ['tipo', 'lado', 'posição', 'curso', 'carga_máxima'],
  Motor: ['tipo', 'cilindros', 'potência', 'torque', 'aplicação'],
  Elétrica: ['voltagem', 'tipo', 'amperagem', 'potência', 'conectores'],
  Transmissão: ['tipo', 'marchas', 'torque_suportado', 'relação'],
  Filtros: ['tipo', 'aplicação', 'dimensões', 'material', 'microns'],
  'Óleo e Fluidos': ['tipo', 'viscosidade', 'especificação', 'volume', 'aplicação'],
  Pneus: ['largura', 'perfil', 'aro', 'índice_carga', 'índice_velocidade'],
  Bateria: ['voltagem', 'amperagem', 'cca', 'dimensões', 'tipo'],
  Acessórios: ['tipo', 'material', 'compatibilidade', 'cor'],
};

export default function NovoProdutoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    sku: '',
    oem_codes: '',
    mpn: '',
    brand: '',
    model: '',
    price: '',
    stock_quantity: '0',
    images: [],
    specifications: [{ key: '', value: '' }],
    compatible_vehicles: [''],
    vehicle_compatibilities: [],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load product data if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id, isEditing]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Convert product to form data
      const specs = data.specifications || {};
      const specsArray = Object.entries(specs).map(([key, value]) => ({
        key,
        value: value as string,
      }));

      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
        sku: data.sku,
        oem_codes: Array.isArray(data.oem_codes) ? data.oem_codes.join(', ') : '',
        mpn: data.mpn || '',
        brand: data.brand || '',
        model: data.model || '',
        price: data.price.toString(),
        stock_quantity: data.stock_quantity.toString(),
        images: data.images || [],
        specifications: specsArray.length > 0 ? specsArray : [{ key: '', value: '' }],
        compatible_vehicles:
          data.compatible_vehicles && data.compatible_vehicles.length > 0
            ? data.compatible_vehicles
            : [''],
        vehicle_compatibilities: [],
        is_active: data.is_active,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Erro ao carregar produto');
      navigate('/lojista/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | string[] | boolean | VehicleCompatibility[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // If category changes, update specifications with category-specific fields
    if (field === 'category' && typeof value === 'string' && value) {
      const categorySpecs = categorySpecifications[value] || [];
      const newSpecs = categorySpecs.map((key) => ({ key, value: '' }));
      setFormData((prev) => ({ 
        ...prev, 
        [field]: value,
        specifications: newSpecs.length > 0 ? newSpecs : [{ key: '', value: '' }]
      }));
    }
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleVehicleChange = (index: number, value: string) => {
    const newVehicles = [...formData.compatible_vehicles];
    newVehicles[index] = value;
    setFormData((prev) => ({ ...prev, compatible_vehicles: newVehicles }));
  };

  const addVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      compatible_vehicles: [...prev.compatible_vehicles, ''],
    }));
  };

  const removeVehicle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compatible_vehicles: prev.compatible_vehicles.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Descrição deve ter no mínimo 20 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Preço deve ser um número positivo';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Adicione pelo menos uma imagem do produto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);

      // Convert specifications array to object
      const specifications = formData.specifications
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .reduce((acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        }, {} as Record<string, string>);

      // Filter empty vehicles
      const compatible_vehicles = formData.compatible_vehicles.filter((v) =>
        v.trim()
      );

      // Parse OEM codes
      const oem_codes = formData.oem_codes
        ? formData.oem_codes.split(',').map((s) => s.trim()).filter(Boolean)
        : null;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        sku: formData.sku.trim(),
        oem_codes,
        mpn: formData.mpn.trim() || null,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        images: formData.images,
        specifications,
        compatible_vehicles,
        is_active: formData.is_active,
      };

      if (isEditing && id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;

        // Update vehicle compatibilities
        if (formData.vehicle_compatibilities.length > 0) {
          // Delete existing compatibilities
          await supabase
            .from('product_compatibility')
            .delete()
            .eq('product_id', id);

          // Insert new compatibilities
          const compatibilityData = formData.vehicle_compatibilities
            .filter((comp) => comp.brand && comp.model)
            .map((comp) => ({
              product_id: id,
              brand: comp.brand,
              model: comp.model,
              year_start: comp.year_start,
              year_end: comp.year_end || null,
              engines: comp.engines.length > 0 ? comp.engines : null,
              transmissions: comp.transmissions.length > 0 ? comp.transmissions : null,
              fuel_types: comp.fuel_types.length > 0 ? comp.fuel_types : null,
              notes: comp.notes || null,
            }));

          if (compatibilityData.length > 0) {
            const { error: compError } = await supabase
              .from('product_compatibility')
              .insert(compatibilityData);

            if (compError) console.error('Error saving compatibilities:', compError);
          }
        }

        alert('Produto atualizado com sucesso!');
      } else {
        // Create new product - need to get store_id from session
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Get store for this user
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', userData.user.id)
          .single();

        if (storeError) throw storeError;

        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({ ...productData, store_id: storeData.id })
          .select()
          .single();

        if (error) throw error;

        // Insert vehicle compatibilities
        if (formData.vehicle_compatibilities.length > 0 && newProduct) {
          const compatibilityData = formData.vehicle_compatibilities
            .filter((comp) => comp.brand && comp.model)
            .map((comp) => ({
              product_id: newProduct.id,
              brand: comp.brand,
              model: comp.model,
              year_start: comp.year_start,
              year_end: comp.year_end || null,
              engines: comp.engines.length > 0 ? comp.engines : null,
              transmissions: comp.transmissions.length > 0 ? comp.transmissions : null,
              fuel_types: comp.fuel_types.length > 0 ? comp.fuel_types : null,
              notes: comp.notes || null,
            }));

          if (compatibilityData.length > 0) {
            const { error: compError } = await supabase
              .from('product_compatibility')
              .insert(compatibilityData);

            if (compError) console.error('Error saving compatibilities:', compError);
          }
        }

        alert('Produto cadastrado com sucesso!');
      }

      navigate('/lojista/produtos');
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.code === '23505') {
        setErrors({ sku: 'Este SKU já está em uso' });
        alert('Erro: SKU já está em uso. Por favor, use um SKU diferente.');
      } else {
        alert('Erro ao salvar produto. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/lojista/produtos')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? 'Atualize as informações do produto'
              : 'Preencha as informações do novo produto'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Pastilha de Freio Dianteira Cerâmica"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descreva o produto em detalhes..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU/Código *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: FRE-001"
              />
              {errors.sku && (
                <p className="text-red-600 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Códigos OEM
              </label>
              <input
                type="text"
                value={formData.oem_codes}
                onChange={(e) => handleChange('oem_codes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 123456, 789012 (separados por vírgula)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Códigos de referência OEM (Original Equipment Manufacturer)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MPN (Manufacturer Part Number)
              </label>
              <input
                type="text"
                value={formData.mpn}
                onChange={(e) => handleChange('mpn', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: BP12345"
              />
              <p className="text-sm text-gray-500 mt-1">
                Número da peça do fabricante
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Bosch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Cerâmica Plus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleChange('stock_quantity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Produto ativo
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Imagens do Produto *
          </h2>
          <ImageUpload
            images={formData.images}
            onChange={(images) => {
              handleChange('images', images);
              if (errors.images) {
                setErrors((prev) => ({ ...prev, images: '' }));
              }
            }}
            maxImages={5}
          />
          {errors.images && (
            <p className="text-red-600 text-sm mt-2">{errors.images}</p>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Especificações Técnicas
          </h2>
          <div className="space-y-3">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) =>
                    handleSpecificationChange(index, 'key', e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome (ex: Material)"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecificationChange(index, 'value', e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Valor (ex: Cerâmica)"
                />
                {formData.specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Adicionar Especificação
            </button>
          </div>
        </div>

        {/* Compatible Vehicles - Advanced Matrix */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <VehicleCompatibilityMatrix
            compatibilities={formData.vehicle_compatibilities}
            onChange={(compatibilities) =>
              handleChange('vehicle_compatibilities', compatibilities)
            }
          />
        </div>

        {/* Legacy Compatible Vehicles (Simple Text List) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Compatibilidade Simplificada (Legado)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Use este campo para descrição simples de compatibilidade ou deixe vazio para usar apenas a matriz acima.
          </p>
          <div className="space-y-3">
            {formData.compatible_vehicles.map((vehicle, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => handleVehicleChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fiat Uno 2015-2020"
                />
                {formData.compatible_vehicles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addVehicle}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Adicionar Veículo
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/lojista/produtos')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar Produto'
              : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
