import Modal from './Modal';
import { Customer, Order } from '../../types/lojista';
import { User, Mail, Phone, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import StatusBadge from './StatusBadge';

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  storeId?: string | null;
}

export default function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  storeId,
}: CustomerDetailsModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      fetchCustomerOrders();
    }
  }, [customer, isOpen]);

  const fetchCustomerOrders = async () => {
    if (!customer) return;

    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id);

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Cliente" size="xl">
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Informações do Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{customer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>
            {customer.cpf_cnpj && (
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">CPF/CNPJ</p>
                  <p className="font-medium text-gray-900">{customer.cpf_cnpj}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Estatísticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <ShoppingBag size={24} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customer.orders_count}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {customer.total_spent.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Calendar size={24} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Última Compra</p>
                <p className="text-sm font-medium text-gray-900">
                  {customer.last_purchase_at
                    ? new Date(customer.last_purchase_at).toLocaleDateString(
                        'pt-BR'
                      )
                    : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Histórico de Pedidos
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum pedido encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </p>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
