import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreditCard, DollarSign, MapPin, Edit2, QrCode } from 'lucide-react-native';
import { useCart } from '../contexts/CartContext';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PaymentMethod = 'card' | 'pix' | 'cash';


export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const handleConfirmOrder = async () => {
    // Validate cart is not empty
    if (cartItems.length === 0) {
      navigation.goBack();
      return;
    }
    
    const paymentMethods: Record<PaymentMethod, string> = {
      card: 'Cartão (Maquininha)',
      pix: 'PIX',
      cash: 'Dinheiro',
    };
    const orderNumberBase = `ORD-${Date.now()}`;

    const itemsByStore = cartItems.reduce<Record<string, typeof cartItems>>((acc, item) => {
      if (!item.store_id) return acc;
      if (!acc[item.store_id]) acc[item.store_id] = [];
      acc[item.store_id].push(item);
      return acc;
    }, {});

    const storeIds = Object.keys(itemsByStore);
    if (storeIds.length === 0) {
      return;
    }

    for (let i = 0; i < storeIds.length; i += 1) {
      const storeId = storeIds[i];
      const storeItems = itemsByStore[storeId];
      const orderNumber = `${orderNumberBase}-${i + 1}`;
      const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: user?.id || null,
          customer_name: user?.name || 'Cliente',
          customer_email: user?.email || 'cliente@example.com',
          customer_phone: user?.phone || null,
          store_id: storeId,
          items: storeItems.map((item) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || null,
            part_number: item.partNumber || null,
          })),
          subtotal,
          shipping_cost: 0,
          discount: 0,
          total: subtotal,
          status: 'pending',
          payment_method: paymentMethod === 'card' ? 'credit_card' : paymentMethod,
          delivery_address: {
            cep: user?.address.cep || null,
            street: user?.address.street || null,
            number: user?.address.number || null,
            complement: user?.address.complement || null,
            city: user?.address.city || null,
            state: user?.address.state || null,
          },
          status_history: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              user: 'Cliente',
            },
          ],
        });

      if (orderError) {
        console.error('Failed to create order:', orderError);
        return;
      }

      for (const item of storeItems) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (productError) {
          console.error('Failed to fetch stock:', productError);
          continue;
        }

        const currentStock = Number(productData?.stock_quantity ?? 0);
        const newStock = Math.max(0, currentStock - item.quantity);

        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.id);

        if (stockError) {
          console.error('Failed to update stock:', stockError);
        }
      }
    }
    
    clearCart();
    
    navigation.navigate('OrderSuccess');
  };

  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finalizar Pedido</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MapPin color="#1e3a8a" size={20} />
                <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.editIconButton}
              >
                <Edit2 color="#1e3a8a" size={18} />
              </TouchableOpacity>
            </View>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>
                {user?.address.street || 'Rua não informada'}, {user?.address.number || 'S/N'}
              </Text>
              {!!user?.address.complement && (
                <Text style={styles.addressText}>{user.address.complement}</Text>
              )}
              <Text style={styles.addressText}>
                {(user?.address.city || 'Cidade não informada')} - {user?.address.state || 'UF'}
              </Text>
              <Text style={styles.addressText}>CEP: {user?.address.cep || 'Não informado'}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
              </View>
            </View>

            {/* Opção: Cartão */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radio}>
                  {paymentMethod === 'card' && <View style={styles.radioDot} />}
                </View>
                <CreditCard color="#1e3a8a" size={20} />
                <Text style={styles.paymentLabel}>Cartão (Maquininha)</Text>
              </View>
            </TouchableOpacity>

            {/* Opção: Pix com ícone */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('pix')}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radio}>
                  {paymentMethod === 'pix' && <View style={styles.radioDot} />}
                </View>
                <QrCode color="#32bcad" size={24} />
                <Text style={styles.paymentLabel}>Pix</Text>
              </View>
            </TouchableOpacity>

            {/* Opção: Dinheiro */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radio}>
                  {paymentMethod === 'cash' && <View style={styles.radioDot} />}
                </View>
                <DollarSign color="#1e3a8a" size={20} />
                <Text style={styles.paymentLabel}>Dinheiro</Text>
              </View>
            </TouchableOpacity>

          </View>

          <View style={{ height: 180 }} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R$ {total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
            <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  editIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressText: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  paymentOptionSelected: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e3a8a',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
