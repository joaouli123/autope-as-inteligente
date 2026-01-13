interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'product' | 'customer';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const getOrderStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivering':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '🟡 Pendente';
      case 'confirmed':
        return '🔵 Confirmado';
      case 'delivering':
        return '🟢 Em Entrega';
      case 'delivered':
        return '✅ Entregue';
      case 'cancelled':
        return '🔴 Cancelado';
      default:
        return status;
    }
  };

  const getProductStatusStyle = (status: string) => {
    return status === 'active' || status === 'true'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getProductStatusLabel = (status: string) => {
    return status === 'active' || status === 'true' ? 'Ativo' : 'Inativo';
  };

  const getCustomerStatusStyle = (status: string) => {
    return status === 'blocked'
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  };

  const getCustomerStatusLabel = (status: string) => {
    return status === 'blocked' ? 'Bloqueado' : 'Ativo';
  };

  let styleClass = '';
  let label = '';

  if (type === 'order') {
    styleClass = getOrderStatusStyle(status);
    label = getOrderStatusLabel(status);
  } else if (type === 'product') {
    styleClass = getProductStatusStyle(status);
    label = getProductStatusLabel(status);
  } else if (type === 'customer') {
    styleClass = getCustomerStatusStyle(status);
    label = getCustomerStatusLabel(status);
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass}`}
    >
      {label}
    </span>
  );
}
