import Modal from './Modal';
import { Product } from '../../types/lojista';
import { Calendar, Package, Tag, DollarSign, Box, Star } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto" size="xl">
      <div className="space-y-6">
        {/* Images Gallery */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Imagens</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.images.length > 0 ? (
              product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
              ))
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center col-span-2">
                <Package size={64} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nome do Produto</label>
              <p className="text-base font-medium text-gray-900">
                {product.name}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Categoria</label>
              <p className="text-base font-medium text-gray-900">
                {product.category}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Código/SKU</label>
              <p className="text-base font-medium text-gray-900">
                {product.sku}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Marca</label>
              <p className="text-base font-medium text-gray-900">
                {product.brand || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Modelo</label>
              <p className="text-base font-medium text-gray-900">
                {product.model || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Preço</label>
              <p className="text-base font-medium text-green-600">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Estoque</label>
              <p className="text-base font-medium text-gray-900">
                {product.stock_quantity} unidades
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p
                className={`text-base font-medium ${
                  product.is_active ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {product.is_active ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Descrição
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Especificações Técnicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">{key}:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compatible Vehicles */}
        {product.compatible_vehicles && product.compatible_vehicles.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Veículos Compatíveis
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.compatible_vehicles.map((vehicle, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {vehicle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Star size={24} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Vendas</p>
                <p className="text-lg font-bold text-gray-900">
                  {product.sales_count}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Cadastrado em</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Atualizado em</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
