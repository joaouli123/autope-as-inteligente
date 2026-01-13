import { useState } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import MetricCard from '../../components/lojista/MetricCard';
import type { DashboardMetrics, Order } from '../../types/lojista';

// Mock data (substituir por queries Supabase)
const mockMetrics: DashboardMetrics = {
  revenue_today: 1250.00,
  revenue_month: 12500.00,
  revenue_growth: 12,
  pending_orders: 8,
  processing_orders: 5,
  active_products: 10,
  low_stock_products: 3,
  total_customers: 45,
};

const mockOrders: Order[] = [
  {
    id: '1',
    code: '#PED-1001',
    customer_id: '1',
    customer_name: 'Cliente Exemplo 1',
    customer_email: 'cliente1@example.com',
    store_id: '1',
    items: [],
    subtotal: 145.90,
    shipping: 15.00,
    total: 160.90,
    status: 'pending',
    payment_method: 'card',
    address: {} as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    code: '#PED-1002',
    customer_id: '2',
    customer_name: 'Cliente Exemplo 2',
    customer_email: 'cliente2@example.com',
    store_id: '1',
    items: [],
    subtotal: 145.90,
    shipping: 15.00,
    total: 160.90,
    status: 'pending',
    payment_method: 'pix',
    address: {} as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    code: '#PED-1003',
    customer_id: '3',
    customer_name: 'Cliente Exemplo 3',
    customer_email: 'cliente3@example.com',
    store_id: '1',
    items: [],
    subtotal: 145.90,
    shipping: 15.00,
    total: 160.90,
    status: 'pending',
    payment_method: 'cash',
    address: {} as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function DashboardPage() {
  const [metrics] = useState<DashboardMetrics>(mockMetrics);
  const [recentOrders] = useState<Order[]>(mockOrders);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Hoje"
          value={`R$ ${metrics.revenue_today.toFixed(2).replace('.', ',')}`}
          icon={DollarSign}
          trend={{ value: `${metrics.revenue_growth}%`, isPositive: true }}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Pedidos Pendentes"
          value={`${metrics.pending_orders}`}
          icon={ShoppingCart}
          trend={{ value: `+${metrics.processing_orders}`, isPositive: false }}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Produtos Ativos"
          value={`${metrics.active_products}`}
          icon={Package}
          trend={{ value: `+${metrics.low_stock_products}`, isPositive: true }}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Total de Clientes"
          value={`${metrics.total_customers}`}
          icon={TrendingUp}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusConfig[order.status].color
                      }`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
