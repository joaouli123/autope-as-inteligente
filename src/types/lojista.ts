export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  cnpj: string;
  logo_url?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  code: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  store_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'card' | 'pix' | 'cash';
  address: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf_cnpj: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

export interface DashboardMetrics {
  revenue_today: number;
  revenue_month: number;
  revenue_growth: number;
  pending_orders: number;
  processing_orders: number;
  active_products: number;
  low_stock_products: number;
  total_customers: number;
}
