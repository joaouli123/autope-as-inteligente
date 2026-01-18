import { useState, useEffect } from 'react';
import { Eye, Mail, Ban, CheckCircle, Plus, User, Phone, FileText, MapPin, X } from 'lucide-react';
import type { Customer } from '../../types/lojista';
import SearchBar from '../../components/lojista/SearchBar';
import FilterBar from '../../components/lojista/FilterBar';
import Table, { Column } from '../../components/lojista/Table';
import ActionMenu from '../../components/lojista/ActionMenu';
import StatusBadge from '../../components/lojista/StatusBadge';
import CustomerDetailsModal from '../../components/lojista/CustomerDetailsModal';
import Modal from '../../components/lojista/Modal';
import { supabase } from '../../services/supabaseClient';
import { useLojistaAuth } from '../../contexts/LojistaAuthContext';

export default function ClientesPage() {
  const { store } = useLojistaAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });

  // Fetch customers from Supabase
  useEffect(() => {
    fetchCustomers();
  }, [store?.id]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      if (!store?.id) {
        setCustomers([]);
        setFilteredCustomers([]);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('customer_id, customer_name, customer_email, customer_phone, total, created_at, order_number')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orders = ordersData || [];
      const customerIds = Array.from(new Set(orders.map((o) => o.customer_id).filter(Boolean)));

      let usersMap = new Map<string, any>();
      if (customerIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, phone, cpf_cnpj, is_blocked, created_at')
          .in('id', customerIds);

        if (usersError) throw usersError;
        usersMap = new Map((usersData || []).map((u) => [u.id, u]));
      }

      const customerStats = new Map<string, Customer>();

      orders.forEach((order) => {
        if (!order.customer_id) return;

        const existing = customerStats.get(order.customer_id);
        const lastPurchaseAt = existing?.last_purchase_at
          ? new Date(existing.last_purchase_at)
          : null;
        const orderDate = new Date(order.created_at);

        const isLatest = !lastPurchaseAt || orderDate > lastPurchaseAt;

        const base = existing || {
          id: order.customer_id,
          name: order.customer_name || 'Cliente',
          email: order.customer_email || '-',
          phone: order.customer_phone || '-',
          cpf_cnpj: undefined,
          is_blocked: false,
          orders_count: 0,
          total_spent: 0,
          last_purchase_at: undefined,
          last_order_total: undefined,
          last_order_number: undefined,
          created_at: order.created_at,
        };

        customerStats.set(order.customer_id, {
          ...base,
          orders_count: base.orders_count + 1,
          total_spent: base.total_spent + Number(order.total || 0),
          last_purchase_at: isLatest ? order.created_at : base.last_purchase_at,
          last_order_total: isLatest ? Number(order.total || 0) : base.last_order_total,
          last_order_number: isLatest ? order.order_number : base.last_order_number,
        });
      });

      const merged = Array.from(customerStats.values()).map((customer) => {
        const user = usersMap.get(customer.id);
        if (!user) return customer;
        return {
          ...customer,
          name: user.name || customer.name,
          email: user.email || customer.email,
          phone: user.phone || customer.phone,
          cpf_cnpj: user.cpf_cnpj || customer.cpf_cnpj,
          is_blocked: user.is_blocked ?? customer.is_blocked,
          created_at: user.created_at || customer.created_at,
        };
      });

      // Include manual customers created by this store when column exists
      try {
        const { data: manualCustomers, error: manualError } = await supabase
          .from('users')
          .select('id, name, email, phone, cpf_cnpj, is_blocked, created_at')
          .eq('created_by_store_id', store.id);

        if (!manualError && manualCustomers) {
          const manualList = manualCustomers
            .filter((u) => !merged.some((c) => c.id === u.id))
            .map((u) => ({
              id: u.id,
              name: u.name || 'Cliente',
              email: u.email || '-',
              phone: u.phone || '-',
              cpf_cnpj: u.cpf_cnpj || undefined,
              is_blocked: u.is_blocked ?? false,
              orders_count: 0,
              total_spent: 0,
              last_purchase_at: undefined,
              last_order_total: undefined,
              last_order_number: undefined,
              created_at: u.created_at || new Date().toISOString(),
            }));
          merged.push(...manualList);
        }
      } catch (err) {
        // ignore if column doesn't exist
      }

      setCustomers(merged);
      setFilteredCustomers(merged);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(search.toLowerCase()) ||
          customer.cpf_cnpj?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((customer) =>
        statusFilter === 'blocked' ? customer.is_blocked : !customer.is_blocked
      );
    }

    setFilteredCustomers(filtered);
  }, [search, statusFilter, customers]);

  const handleToggleBlock = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: !customer.is_blocked })
        .eq('id', customer.id);

      if (error) throw error;

      // Update local state
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, is_blocked: !c.is_blocked } : c
        )
      );

      alert(
        `Cliente ${customer.is_blocked ? 'desbloqueado' : 'bloqueado'} com sucesso!`
      );
    } catch (error) {
      console.error('Error toggling customer block:', error);
      alert('Erro ao atualizar status do cliente');
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const validateNewCustomer = () => {
    const errors: Record<string, string> = {};
    if (!newCustomer.name.trim()) errors.name = 'Nome é obrigatório';
    if (!newCustomer.email.trim()) errors.email = 'Email é obrigatório';
    if (!newCustomer.phone.trim()) errors.phone = 'Telefone é obrigatório';
    if (!newCustomer.cpf_cnpj.trim()) errors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
    if (!newCustomer.cep.trim()) errors.cep = 'CEP é obrigatório';
    if (!newCustomer.street.trim()) errors.street = 'Rua é obrigatória';
    if (!newCustomer.number.trim()) errors.number = 'Número é obrigatório';
    if (!newCustomer.city.trim()) errors.city = 'Cidade é obrigatória';
    if (!newCustomer.state.trim()) errors.state = 'UF é obrigatória';
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) return;
    try {
      setCreating(true);

      const id = crypto.randomUUID();
      const payload = {
        id,
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim(),
        cpf_cnpj: newCustomer.cpf_cnpj.trim(),
        role: 'consumer',
        is_blocked: false,
        created_by_store_id: store?.id || null,
        address: {
          cep: newCustomer.cep.trim(),
          street: newCustomer.street.trim(),
          number: newCustomer.number.trim(),
          complement: newCustomer.complement.trim(),
          city: newCustomer.city.trim(),
          state: newCustomer.state.trim(),
        },
      };

      let { error } = await supabase.from('users').insert(payload);

      // Fallback if address column doesn't exist
      if (error && error.code === '42703') {
        const { address, ...safePayload } = payload as any;
        ({ error } = await supabase.from('users').insert(safePayload));
      }

      if (error) throw error;

      const createdCustomer: Customer = {
        id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        cpf_cnpj: payload.cpf_cnpj,
        is_blocked: false,
        orders_count: 0,
        total_spent: 0,
        last_purchase_at: undefined,
        last_order_total: undefined,
        last_order_number: undefined,
        created_at: new Date().toISOString(),
      };

      setCustomers((prev) => [createdCustomer, ...prev]);
      setFilteredCustomers((prev) => [createdCustomer, ...prev]);
      setShowCreateModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        cpf_cnpj: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        city: '',
        state: '',
      });
      setCreateErrors({});
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Erro ao criar cliente');
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            {customer.name ? customer.name[0].toUpperCase() : '?'}
          </div>
          <span className="font-medium text-gray-900">{customer.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'cpf_cnpj',
      label: 'CPF/CNPJ',
      render: (customer) => (
        <span className="text-gray-700">{customer.cpf_cnpj || '-'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (customer) => (
        <span className="text-gray-700">{customer.email}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (customer) => (
        <span className="text-gray-700">{customer.phone || '-'}</span>
      ),
    },
    {
      key: 'orders_count',
      label: 'Pedidos',
      sortable: true,
      render: (customer) => (
        <span className="font-semibold text-gray-900">
          {customer.orders_count}
        </span>
      ),
    },
    {
      key: 'total_spent',
      label: 'Total Gasto',
      sortable: true,
      render: (customer) => (
        <span className="font-semibold text-green-600">
          R$ {customer.total_spent.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      key: 'last_purchase_at',
      label: 'Última Compra',
      sortable: true,
      render: (customer) => (
        <span className="text-sm text-gray-600">
          {customer.last_purchase_at
            ? new Date(customer.last_purchase_at).toLocaleDateString('pt-BR')
            : '-'}
        </span>
      ),
    },
    {
      key: 'last_order_total',
      label: 'Último Pedido',
      render: (customer) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">
            {customer.last_order_total !== undefined
              ? `R$ ${customer.last_order_total.toFixed(2).replace('.', ',')}`
              : '-'}
          </div>
          <div className="text-gray-500">
            {customer.last_order_number || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'is_blocked',
      label: 'Status',
      render: (customer) => (
        <StatusBadge
          status={customer.is_blocked ? 'blocked' : 'active'}
          type="customer"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (customer) => (
        <ActionMenu
          items={[
            {
              label: 'Ver detalhes',
              icon: <Eye size={16} />,
              onClick: () => handleViewDetails(customer),
            },
            {
              label: 'Histórico de pedidos',
              icon: <Eye size={16} />,
              onClick: () => handleViewDetails(customer),
            },
            {
              label: 'Enviar mensagem',
              icon: <Mail size={16} />,
              onClick: () => {
                window.location.href = `mailto:${customer.email}`;
              },
            },
            {
              label: customer.is_blocked ? 'Desbloquear' : 'Bloquear',
              icon: customer.is_blocked ? (
                <CheckCircle size={16} />
              ) : (
                <Ban size={16} />
              ),
              onClick: () => handleToggleBlock(customer),
              variant: customer.is_blocked ? 'default' : 'danger',
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#1f4461] to-[#34abd5] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <Plus size={20} strokeWidth={2.5} />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#34abd5]/10 rounded-2xl p-6 border border-[#34abd5]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#34abd5] font-semibold">Total de Clientes</p>
              <p className="text-3xl font-bold text-[#1f4461]">
                {customers.length}
              </p>
            </div>
            <Eye size={32} className="text-[#34abd5]" strokeWidth={2} />
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Clientes Ativos</p>
              <p className="text-3xl font-bold text-green-900">
                {customers.filter((c) => !c.is_blocked).length}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Clientes Bloqueados</p>
              <p className="text-3xl font-bold text-red-900">
                {customers.filter((c) => c.is_blocked).length}
              </p>
            </div>
            <Ban size={32} className="text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, CPF/CNPJ, email ou telefone..."
        />
        <FilterBar
          filters={[
            {
              label: 'Status',
              options: [
                { label: 'Todos', value: 'all' },
                { label: 'Ativos', value: 'active' },
                { label: 'Bloqueados', value: 'blocked' },
              ],
              value: statusFilter,
              onChange: setStatusFilter,
            },
          ]}
        />
      </div>

      {/* Customers Table */}
      <Table
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(customer) => customer.id}
        onRowClick={(customer) => handleViewDetails(customer)}
        loading={loading}
        emptyMessage="Nenhum cliente encontrado"
      />

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Cliente"
        size="xl"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCustomer}
              disabled={creating}
              className="px-5 py-3 text-white bg-gradient-to-r from-[#1f4461] to-[#34abd5] rounded-xl font-bold hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {creating ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do cliente"
                />
              </div>
              {createErrors.name && <p className="text-xs text-red-600 mt-1">{createErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCustomer.cpf_cnpj}
                  onChange={(e) => setNewCustomer({ ...newCustomer, cpf_cnpj: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>
              {createErrors.cpf_cnpj && <p className="text-xs text-red-600 mt-1">{createErrors.cpf_cnpj}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="cliente@email.com"
                />
              </div>
              {createErrors.email && <p className="text-xs text-red-600 mt-1">{createErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
              {createErrors.phone && <p className="text-xs text-red-600 mt-1">{createErrors.phone}</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} /> Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                <input
                  value={newCustomer.cep}
                  onChange={(e) => setNewCustomer({ ...newCustomer, cep: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="00000-000"
                />
                {createErrors.cep && <p className="text-xs text-red-600 mt-1">{createErrors.cep}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                <input
                  value={newCustomer.street}
                  onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua do cliente"
                />
                {createErrors.street && <p className="text-xs text-red-600 mt-1">{createErrors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                <input
                  value={newCustomer.number}
                  onChange={(e) => setNewCustomer({ ...newCustomer, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
                {createErrors.number && <p className="text-xs text-red-600 mt-1">{createErrors.number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                <input
                  value={newCustomer.complement}
                  onChange={(e) => setNewCustomer({ ...newCustomer, complement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Apto, bloco (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Cidade"
                />
                {createErrors.city && <p className="text-xs text-red-600 mt-1">{createErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UF</label>
                <input
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="UF"
                />
                {createErrors.state && <p className="text-xs text-red-600 mt-1">{createErrors.state}</p>}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        storeId={store?.id}
      />
    </div>
  );
}
