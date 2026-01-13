import { useState, useEffect } from 'react';
import { Eye, Mail, Ban, CheckCircle } from 'lucide-react';
import type { Customer } from '../../types/lojista';
import SearchBar from '../../components/lojista/SearchBar';
import FilterBar from '../../components/lojista/FilterBar';
import Table, { Column } from '../../components/lojista/Table';
import ActionMenu from '../../components/lojista/ActionMenu';
import StatusBadge from '../../components/lojista/StatusBadge';
import CustomerDetailsModal from '../../components/lojista/CustomerDetailsModal';
import { supabase } from '../../services/supabaseClient';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch customers from Supabase
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'consumer')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
      setFilteredCustomers(data || []);
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
              label: 'Ver histórico',
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total de Clientes</p>
              <p className="text-3xl font-bold text-blue-900">
                {customers.length}
              </p>
            </div>
            <Eye size={32} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Clientes Ativos</p>
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

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}
