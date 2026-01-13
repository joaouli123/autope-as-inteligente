import Modal from './Modal';
import { Order } from '../../types/lojista';
import StatusBadge from './StatusBadge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Package,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusChange,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'pix':
        return 'PIX';
      case 'cash':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  const handleStatusChange = () => {
    const statuses = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    
    if (currentIndex < statuses.length - 1) {
      const newStatus = statuses[currentIndex + 1];
      onStatusChange?.(order.id, newStatus);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido ${order.order_number}`}
      size="xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={handleStatusChange}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Avançar Status
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Status and Date */}
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} type="order" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            {new Date(order.created_at).toLocaleString('pt-BR')}
          </div>
        </div>

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
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
            </div>
            {order.customer_email && (
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.customer_email}</p>
                </div>
              </div>
            )}
            {order.customer_phone && (
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Forma de Pagamento</p>
                <p className="font-medium text-gray-900">
                  {getPaymentMethodLabel(order.payment_method)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Endereço de Entrega
          </h3>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <MapPin size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">
                {order.delivery_address.street}, {order.delivery_address.number}
              </p>
              {order.delivery_address.complement && (
                <p className="text-sm text-gray-600">
                  {order.delivery_address.complement}
                </p>
              )}
              <p className="text-sm text-gray-600">
                {order.delivery_address.neighborhood}
              </p>
              <p className="text-sm text-gray-600">
                {order.delivery_address.city} - {order.delivery_address.state}
              </p>
              <p className="text-sm text-gray-600">
                CEP: {order.delivery_address.cep}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Itens do Pedido
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-600">
                    R$ {item.price.toFixed(2).replace('.', ',')} cada
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Resumo do Pedido
          </h3>
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Frete</span>
              <span>R$ {order.shipping_cost.toFixed(2).replace('.', ',')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Status History */}
        {order.status_history && order.status_history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Histórico de Status
            </h3>
            <div className="space-y-2">
              {order.status_history.map((history, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <StatusBadge status={history.status} type="order" />
                  <span className="text-sm text-gray-600">
                    {new Date(history.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Observações
            </h3>
            <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
              {order.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
