import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Edit, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Product } from '../../types/lojista';
import SearchBar from '../../components/lojista/SearchBar';
import FilterBar from '../../components/lojista/FilterBar';
import ActionMenu from '../../components/lojista/ActionMenu';
import StatusBadge from '../../components/lojista/StatusBadge';
import ProductDetailsModal from '../../components/lojista/ProductDetailsModal';
import { supabase } from '../../services/supabaseClient';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) =>
        statusFilter === 'active' ? product.is_active : !product.is_active
      );
    }

    setFilteredProducts(filtered);
  }, [search, categoryFilter, statusFilter, products]);

  const handleToggleStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Erro ao atualizar status do produto');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja deletar "${product.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      alert('Produto deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao deletar produto');
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, SKU, categoria ou marca..."
        />
        <FilterBar
          filters={[
            {
              label: 'Categoria',
              options: [
                { label: 'Todas', value: 'all' },
                ...categories.map((cat) => ({ label: cat, value: cat })),
              ],
              value: categoryFilter,
              onChange: setCategoryFilter,
            },
            {
              label: 'Status',
              options: [
                { label: 'Todos', value: 'all' },
                { label: 'Ativos', value: 'active' },
                { label: 'Inativos', value: 'inactive' },
              ],
              value: statusFilter,
              onChange: setStatusFilter,
            },
          ]}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {search || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro produto'}
          </p>
          {!search && categoryFilter === 'all' && statusFilter === 'all' && (
            <Link
              to="/lojista/produtos/novo"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Adicionar Produto
            </Link>
          )}
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={64} className="text-gray-400" />
                )}
                <div className="absolute top-3 right-3">
                  <ActionMenu
                    items={[
                      {
                        label: 'Ver detalhes',
                        icon: <Eye size={16} />,
                        onClick: () => handleViewDetails(product),
                      },
                      {
                        label: 'Editar',
                        icon: <Edit size={16} />,
                        onClick: () => {
                          window.location.href = `/lojista/produtos/${product.id}`;
                        },
                      },
                      {
                        label: product.is_active ? 'Desativar' : 'Ativar',
                        icon: product.is_active ? (
                          <ToggleLeft size={16} />
                        ) : (
                          <ToggleRight size={16} />
                        ),
                        onClick: () => handleToggleStatus(product),
                      },
                      {
                        label: 'Deletar',
                        icon: <Trash2 size={16} />,
                        onClick: () => handleDelete(product),
                        variant: 'danger',
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="text-lg font-bold text-gray-900 flex-1"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {product.category}
                  </span>
                  <StatusBadge
                    status={product.is_active ? 'active' : 'inactive'}
                    type="product"
                  />
                </div>
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-3">
                    Marca: {product.brand}
                    {product.model && ` • ${product.model}`}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-gray-600">
                    Estoque: {product.stock_quantity}
                  </span>
                </div>
                <Link
                  to={`/lojista/produtos/${product.id}`}
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Editar Produto
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}
