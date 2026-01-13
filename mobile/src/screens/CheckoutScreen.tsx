import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreditCard, DollarSign, MapPin, Edit2 } from 'lucide-react-native';
import { useCart } from '../contexts/CartContext';
import { sendOrderEmails } from '../services/emailService';
import type { RootStackParamList } from '../types/navigation';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PaymentMethod = 'card' | 'pix' | 'cash';

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, getCartTotal, createOrder } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

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
    const order = createOrder(paymentMethods[paymentMethod]);
    
    // Send order confirmation emails
    try {
      await sendOrderEmails({
        orderCode: order.id,
        customerName: 'Cliente',
        customerEmail: 'cliente@example.com',
        storeEmail: 'loja@autopecascentral.com',
        storeName: 'Auto Peças Central',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getCartTotal() + 15.90,
        address: {
          street: 'Av. Paulista',
          number: '1000',
          city: 'São Paulo',
          state: 'SP',
        },
      });
    } catch (error) {
      console.error('Failed to send order emails:', error);
      // Continue anyway - don't block order completion
    }
    
    navigation.navigate('OrderSuccess');
  };

  const shippingFee = 15.90;
  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;

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
                onPress={() => navigation.navigate('EditProfile' as any)}
                style={styles.editIconButton}
              >
                <Edit2 color="#1e3a8a" size={18} />
              </TouchableOpacity>
            </View>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>Av. Paulista, 1000</Text>
              <Text style={styles.addressText}>Apto 101</Text>
              <Text style={styles.addressText}>São Paulo - SP</Text>
              <Text style={styles.addressText}>CEP: 01310-100</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <CreditCard color="#1e3a8a" size={20} />
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

            {/* Opção: Pix com logo oficial */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('pix')}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.radio}>
                  {paymentMethod === 'pix' && <View style={styles.radioDot} />}
                </View>
                <Image
                  source={{ uri: 'https://logodownload.org/wp-content/uploads/2020/02/pix-bc-logo-0.png' }}
                  style={styles.pixLogo}
                />
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
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Frete</Text>
            <Text style={styles.priceValue}>
              R$ {shippingFee.toFixed(2).replace('.', ',')}
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
  pixLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
