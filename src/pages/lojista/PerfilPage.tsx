import { useState, useEffect } from 'react';
import {
  Store,
  Star,
  DollarSign,
  ShoppingBag,
  Users,
  Settings,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
} from 'lucide-react';
import ImageUpload from '../../components/lojista/ImageUpload';
import type { Store as StoreType, StoreReview } from '../../types/lojista';
import StatsCard from '../../components/lojista/StatsCard';
import ReviewCard from '../../components/lojista/ReviewCard';
import { supabase } from '../../services/supabaseClient';

export default function PerfilPage() {
  const [store, setStore] = useState<StoreType | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    logo_url: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
    },
    opening_hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: { open: '', close: '' },
    },
    social_media: {
      instagram: '',
      facebook: '',
      whatsapp: '',
    },
    settings: {
      notifications_enabled: true,
      email_notifications: true,
      return_policy: '',
      default_delivery_days: 5,
      free_shipping_above: 0,
    },
  });

  // Monthly stats
  const [monthlyStats, setMonthlyStats] = useState({
    revenue: 0,
    orders: 0,
    newCustomers: 0,
  });

  useEffect(() => {
    fetchStoreData();
    fetchReviews();
    fetchMonthlyStats();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userData.user.id)
        .single();

      if (storeError) throw storeError;

      setStore(storeData);
      setFormData({
        name: storeData.name || '',
        email: storeData.email || '',
        phone: storeData.phone || '',
        description: storeData.description || '',
        logo_url: storeData.logo_url || '',
        address: storeData.address || formData.address,
        opening_hours: storeData.opening_hours || formData.opening_hours,
        social_media: storeData.social_media || formData.social_media,
        settings: storeData.settings || formData.settings,
      });
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single();

      if (storeError) throw storeError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('store_reviews')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) {
        // Tratar erro 404 (tabela não existe)
        if (reviewsError.code === 'PGRST116' || reviewsError.code === '42P01') {
          console.warn('Tabela store_reviews não existe. Execute o SQL para criá-la.');
          setReviews([]);
          return;
        }
        throw reviewsError;
      }

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);  // Não travar a página, apenas mostrar lista vazia
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single();

      if (storeError) throw storeError;

      // Get current month orders
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total, customer_id')
        .eq('store_id', storeData.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (ordersError) throw ordersError;

      const revenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;
      const orders = ordersData?.length || 0;
      const uniqueCustomers = new Set(ordersData?.map(o => o.customer_id)).size;

      setMonthlyStats({
        revenue,
        orders,
        newCustomers: uniqueCustomers,
      });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          logo_url: formData.logo_url,
          address: formData.address,
          opening_hours: formData.opening_hours,
          social_media: formData.social_media,
          settings: formData.settings,
        })
        .eq('id', store.id);

      if (error) throw error;

      alert('Informações atualizadas com sucesso!');
      setEditMode(false);
      fetchStoreData();
    } catch (error) {
      console.error('Error saving store data:', error);
      alert('Erro ao salvar informações');
    } finally {
      setSaving(false);
    }
  };

  const getRatingDistribution = () => {
    if (reviews.length === 0) {
      return [0, 0, 0, 0, 0];
    }

    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const renderStars = (rating: number, size: number = 24) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loja não encontrada</p>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
          <p className="text-gray-600">Gerencie as informações da sua loja</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Settings size={20} />
            Editar Informações
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditMode(false);
                fetchStoreData();
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Faturamento do Mês"
          value={`R$ ${monthlyStats.revenue.toFixed(2).replace('.', ',')}`}
          icon={DollarSign}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pedidos do Mês"
          value={monthlyStats.orders.toString()}
          icon={ShoppingBag}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Novos Clientes"
          value={monthlyStats.newCustomers.toString()}
          icon={Users}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Nota Média"
          value={(store.average_rating ?? 0).toFixed(1)}
          icon={Star}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          subtitle={`${store.total_reviews ?? 0} avaliações`}
        />
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Informações da Loja
        </h2>
        <div className="space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Loja
            </label>
            {editMode ? (
              <div className="space-y-3">
                <ImageUpload
                  images={formData.logo_url ? [formData.logo_url] : []}
                  onChange={(images) =>
                    setFormData({ ...formData, logo_url: images[0] || '' })
                  }
                  maxImages={1}
                />
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="URL da logo (opcional)"
                />
              </div>
            ) : (
              formData.logo_url && (
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
              )
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Loja
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{store.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ
              </label>
              <p className="text-gray-900">{store.cnpj || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {editMode ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{store.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{store.phone}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Loja
            </label>
            {editMode ? (
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua loja..."
              />
            ) : (
              <p className="text-gray-900">{store.description || '-'}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua"
                />
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, number: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número"
                />
                <input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, complement: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Complemento"
                />
                <input
                  type="text"
                  value={formData.address.neighborhood}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, neighborhood: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bairro"
                />
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cidade"
                />
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Estado"
                />
                <input
                  type="text"
                  value={formData.address.cep}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, cep: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CEP"
                />
              </div>
            ) : (
              <p className="text-gray-900">
                {store.address.street}, {store.address.number}
                {store.address.complement && ` - ${store.address.complement}`}
                <br />
                {store.address.neighborhood}, {store.address.city} -{' '}
                {store.address.state}
                <br />
                CEP: {store.address.cep}
              </p>
            )}
          </div>

          {/* Social Media */}
          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redes Sociais
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.social_media.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_media: {
                        ...formData.social_media,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Instagram"
                />
                <input
                  type="text"
                  value={formData.social_media.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_media: {
                        ...formData.social_media,
                        facebook: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Facebook"
                />
                <input
                  type="text"
                  value={formData.social_media.whatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_media: {
                        ...formData.social_media,
                        whatsapp: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="WhatsApp"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews and Ratings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Avaliações e Estatísticas
        </h2>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Average Rating */}
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {(store.average_rating ?? 0).toFixed(1)}
            </div>
            {renderStars(Math.round(store.average_rating ?? 0), 32)}
            <p className="text-gray-600 mt-2">
              {store.total_reviews ?? 0} avaliações
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars, index) => {
              const count = ratingDistribution[index];
              const percentage =
                (store.total_reviews ?? 0) > 0
                  ? (count / (store.total_reviews ?? 0)) * 100
                  : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">
                    {stars} ⭐
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reviews */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Avaliações Recentes
          </h3>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma avaliação ainda
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onResponseAdded={fetchReviews}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      {editMode && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Configurações Gerais
          </h2>
          <div className="space-y-4">
            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.notifications_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        notifications_enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Receber notificações
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.email_notifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        email_notifications: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Notificações por email
                </span>
              </label>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de entrega padrão (dias)
                </label>
                <input
                  type="number"
                  value={formData.settings.default_delivery_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        default_delivery_days: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frete grátis acima de (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.settings.free_shipping_above}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        free_shipping_above: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Return Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Política de troca/devolução
              </label>
              <textarea
                value={formData.settings.return_policy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      return_policy: e.target.value,
                    },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua política de troca e devolução..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
