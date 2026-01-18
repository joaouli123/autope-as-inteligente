import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList, Package, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { ORDER_STATUS_MAP, type Order } from '../types/order';

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, total, payment_method, items, delivery_address, stores(name, phone)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[OrdersScreen] Failed to load orders:', error.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((order) => ({
        id: order.order_number,
        date: order.created_at,
        status: order.status,
        items: Array.isArray(order.items)
          ? order.items.map((item: any) => ({
              id: item.product_id || '',
              name: item.name || 'Produto',
              description: '',
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 1),
              image: item.image || undefined,
              store_id: '',
              brand: '',
              partNumber: item.part_number || '',
            }))
          : [],
        total: Number(order.total || 0),
        paymentMethod:
          order.payment_method === 'credit_card'
            ? 'Cartão (Maquininha)'
            : order.payment_method === 'pix'
            ? 'PIX'
            : order.payment_method === 'cash'
            ? 'Dinheiro'
            : String(order.payment_method || ''),
        storeName: order.stores?.name || undefined,
        storePhone: order.stores?.phone || undefined,
        deliveryAddress: {
          street: order.delivery_address?.street || '',
          number: order.delivery_address?.number || '',
          complement: order.delivery_address?.complement || '',
          city: order.delivery_address?.city || '',
          state: order.delivery_address?.state || '',
          cep: order.delivery_address?.cep || '',
        },
      }));

      setOrders(mapped);
      setLoading(false);
    };

    fetchOrders();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meus Pedidos</Text>
          </View>
          <View style={styles.emptyContainer}>
            <ClipboardList color="#9ca3af" size={80} />
            <Text style={styles.emptyTitle}>Carregando pedidos...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meus Pedidos</Text>
          </View>
          <View style={styles.emptyContainer}>
            <ClipboardList color="#9ca3af" size={80} />
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptySubtitle}>
              Seus pedidos aparecerão aqui após a compra
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Package color="#1e3a8a" size={24} />
                    <View style={styles.orderHeaderInfo}>
                      <Text style={styles.orderNumber}>Pedido {order.id}</Text>
                      <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                    </View>
                  </View>
                  <ChevronRight color="#9ca3af" size={20} />
                </View>

                <View style={[styles.statusBadge, { backgroundColor: hexToRgba(statusInfo.color, 0.12) }]}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
                  />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>

                <View style={styles.orderItems}>
                  {order.items.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.orderItemText}>
                      • {item.quantity}x {item.name}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={styles.orderItemText}>
                      e mais {order.items.length - 2} {order.items.length - 2 === 1 ? 'item' : 'itens'}
                    </Text>
                  )}
                </View>

                {(order.storeName || order.storePhone) && (
                  <View style={styles.storeInfo}>
                    {order.storeName && (
                      <Text style={styles.storeName}>{order.storeName}</Text>
                    )}
                    {order.storePhone && (
                      <Text style={styles.storePhone}>{order.storePhone}</Text>
                    )}
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Total: R$ {order.total.toFixed(2).replace('.', ',')}
                  </Text>
                  <Text style={styles.orderPayment}>{order.paymentMethod}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderHeaderInfo: {
    gap: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  orderDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderItems: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 6,
  },
  storeInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  storePhone: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  orderItemText: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  orderPayment: {
    fontSize: 13,
    color: '#6b7280',
  },
});
