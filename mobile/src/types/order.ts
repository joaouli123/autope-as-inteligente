export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
  stock_quantity?: number;
  store_id: string;
  brand: string;
  partNumber: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  paymentMethod: string;
  storeName?: string;
  storePhone?: string;
  deliveryAddress: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    cep: string;
  };
}

export interface OrderStatus {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  label: string;
  color: string;
}

export const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: { status: 'pending', label: 'Pendente', color: '#fbbf24' },
  processing: { status: 'processing', label: 'Processando', color: '#3b82f6' },
  shipped: { status: 'shipped', label: 'Enviado', color: '#8b5cf6' },
  delivered: { status: 'delivered', label: 'Entregue', color: '#10b981' },
  cancelled: { status: 'cancelled', label: 'Cancelado', color: '#ef4444' },
};
