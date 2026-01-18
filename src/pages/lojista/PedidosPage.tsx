import { useState, useEffect } from 'react';
import { Calendar, CreditCard, User, DollarSign, Eye, Edit, X } from 'lucide-react';
import type { Order } from '../../types/lojista';
import SearchBar from '../../components/lojista/SearchBar';
import FilterBar from '../../components/lojista/FilterBar';
import Table, { Column } from '../../components/lojista/Table';
import ActionMenu from '../../components/lojista/ActionMenu';
import StatusBadge from '../../components/lojista/StatusBadge';
import OrderDetailsModal from '../../components/lojista/OrderDetailsModal';
import { supabase } from '../../services/supabaseClient';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch orders from Supabase
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(search.toLowerCase()) ||
          order.customer_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.payment_method === paymentFilter
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const orderDay = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate()
        );

        switch (dateFilter) {
          case 'today':
            return orderDay.getTime() === today.getTime();
          case '7days':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return orderDay >= sevenDaysAgo;
          case '30days':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return orderDay >= thirtyDaysAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [search, statusFilter, paymentFilter, dateFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const statusHistory = [
        ...(order.status_history || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          user: 'Lojista',
        },
      ];

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_history: statusHistory,
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus as Order['status'], status_history: statusHistory }
            : o
        )
      );

      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus as Order['status'],
          status_history: statusHistory,
        });
      }

      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (
      !confirm(
        `Tem certeza que deseja cancelar o pedido ${order.order_number}?`
      )
    ) {
      return;
    }

    handleStatusChange(order.id, 'cancelled');
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      credit_card: 'bg-[#1f4461]/10 text-[#1f4461] border border-[#1f4461]/20',
      pix: 'bg-[#34abd5]/10 text-[#34abd5] border border-[#34abd5]/20',
      cash: 'bg-[#e99950]/10 text-[#e99950] border border-[#e99950]/20',
    };

    const labels: Record<string, string> = {
      credit_card: 'Cartão',
      pix: 'PIX',
      cash: 'Dinheiro',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[method] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[method] || method}
      </span>
    );
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Nº Pedido',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-gray-900">{order.order_number}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Data',
      sortable: true,
      render: (order) => (
        <div className="text-sm">
          <div>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
          <div className="text-gray-500">
            {new Date(order.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'customer_name',
      label: 'Cliente',
      sortable: true,
      render: (order) => <span>{order.customer_name}</span>,
    },
    {
      key: 'total',
      label: 'Valor Total',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-green-600">
          R$ {order.total.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Pagamento',
      render: (order) => getPaymentMethodBadge(order.payment_method),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => <StatusBadge status={order.status} type="order" />,
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (order) => (
        <ActionMenu
          items={[
            {
              label: 'Ver detalhes',
              icon: <Eye size={16} />,
              onClick: () => handleViewDetails(order),
            },
            {
              label: 'Alterar status',
              icon: <Edit size={16} />,
              onClick: () => {
                const statuses = [
                  { value: 'pending', label: 'Pendente' },
                  { value: 'confirmed', label: 'Confirmado' },
                  { value: 'delivering', label: 'Em Entrega' },
                  { value: 'delivered', label: 'Entregue' },
                ];
                const newStatus = prompt(
                  `Status atual: ${order.status}\n\nEscolha o novo status:\n${statuses
                    .map((s, i) => `${i + 1}. ${s.label}`)
                    .join('\n')}`
                );
                if (newStatus) {
                  const statusIndex = parseInt(newStatus) - 1;
                  if (statusIndex >= 0 && statusIndex < statuses.length) {
                    handleStatusChange(order.id, statuses[statusIndex].value);
                  }
                }
              },
            },
            {
              label: 'Cancelar pedido',
              icon: <X size={16} />,
              onClick: () => handleCancelOrder(order),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos da sua loja</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-semibold">Pendentes</p>
              <p className="text-2xl font-bold text-amber-900">
                {orders.filter((o) => o.status === 'pending').length}
              </p>
            </div>
            <Calendar size={32} className="text-amber-600" />
          </div>
        </div>
        <div className="bg-[#34abd5]/10 rounded-xl p-5 border border-[#34abd5]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#34abd5] font-semibold">Confirmados</p>
              <p className="text-2xl font-bold text-[#1f4461]">
                {orders.filter((o) => o.status === 'confirmed').length}
              </p>
            </div>
            <User size={32} className="text-[#34abd5]" />
          </div>
        </div>
        <div className="bg-[#e99950]/10 rounded-xl p-5 border border-[#e99950]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e99950] font-semibold">Em Entrega</p>
              <p className="text-2xl font-bold text-[#1f4461]">
                {orders.filter((o) => o.status === 'delivering').length}
              </p>
            </div>
            <CreditCard size={32} className="text-[#e99950]" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Entregues</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter((o) => o.status === 'delivered').length}
              </p>
            </div>
            <DollarSign size={32} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número do pedido ou nome do cliente..."
        />
        <FilterBar
          filters={[
            {
              label: 'Status',
              options: [
                { label: 'Todos', value: 'all' },
                { label: 'Pendente', value: 'pending' },
                { label: 'Confirmado', value: 'confirmed' },
                { label: 'Em Entrega', value: 'delivering' },
                { label: 'Entregue', value: 'delivered' },
                { label: 'Cancelado', value: 'cancelled' },
              ],
              value: statusFilter,
              onChange: setStatusFilter,
            },
            {
              label: 'Pagamento',
              options: [
                { label: 'Todos', value: 'all' },
                { label: 'Cartão', value: 'credit_card' },
                { label: 'PIX', value: 'pix' },
                { label: 'Dinheiro', value: 'cash' },
              ],
              value: paymentFilter,
              onChange: setPaymentFilter,
            },
            {
              label: 'Data',
              options: [
                { label: 'Todos', value: 'all' },
                { label: 'Hoje', value: 'today' },
                { label: 'Últimos 7 dias', value: '7days' },
                { label: 'Últimos 30 dias', value: '30days' },
              ],
              value: dateFilter,
              onChange: setDateFilter,
            },
          ]}
        />
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        data={filteredOrders}
        keyExtractor={(order) => order.id}
        onRowClick={(order) => handleViewDetails(order)}
        loading={loading}
        emptyMessage="Nenhum pedido encontrado"
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
