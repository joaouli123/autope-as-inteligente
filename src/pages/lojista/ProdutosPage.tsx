import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import type { Product } from '../../types/lojista';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    store_id: '1',
    name: 'Pastilha de Freio Dianteira Cerâmica',
    description: 'Pastilha de freio de alta performance',
    price: 145.90,
    stock: 25,
    images: [],
    category: 'Freios',
    tags: ['freio', 'cerâmica'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ProdutosPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <Link
          to="/lojista/produtos/novo"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Adicionar Produto
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <Package size={64} className="text-gray-400" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm text-gray-600">
                  Estoque: {product.stock}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/lojista/produtos/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </Link>
                <button className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
