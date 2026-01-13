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
import { CreditCard, Smartphone, Barcode, MapPin, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../contexts/CartContext';
import type { RootStackParamList } from '../types/navigation';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PaymentMethod = 'credit' | 'pix' | 'boleto';

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { cartItems, getCartTotal, createOrder } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit');

  const handleConfirmOrder = () => {
    // Validate cart is not empty
    if (cartItems.length === 0) {
      navigation.goBack();
      return;
    }
    
    const paymentMethods: Record<PaymentMethod, string> = {
      credit: 'Cartão de Crédito',
      pix: 'PIX',
      boleto: 'Boleto Bancário',
    };
    createOrder(paymentMethods[selectedPayment]);
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color="#1e3a8a" size={20} />
              <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
            </View>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>Av. Paulista, 1000</Text>
              <Text style={styles.addressText}>Apto 101</Text>
              <Text style={styles.addressText}>São Paulo - SP</Text>
              <Text style={styles.addressText}>CEP: 01310-100</Text>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingCart color="#1e3a8a" size={20} />
              <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
            </View>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQuantity}>Qtd: {item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'credit' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment('credit')}
            >
              <View style={styles.paymentOptionLeft}>
                <CreditCard color={selectedPayment === 'credit' ? '#1e3a8a' : '#6b7280'} size={24} />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPayment === 'credit' && styles.paymentOptionTextSelected,
                ]}>
                  Cartão de Crédito
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === 'credit' && styles.radioButtonSelected,
              ]}>
                {selectedPayment === 'credit' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'pix' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment('pix')}
            >
              <View style={styles.paymentOptionLeft}>
                <Smartphone color={selectedPayment === 'pix' ? '#1e3a8a' : '#6b7280'} size={24} />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPayment === 'pix' && styles.paymentOptionTextSelected,
                ]}>
                  PIX
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === 'pix' && styles.radioButtonSelected,
              ]}>
                {selectedPayment === 'pix' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'boleto' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment('boleto')}
            >
              <View style={styles.paymentOptionLeft}>
                <Barcode color={selectedPayment === 'boleto' ? '#1e3a8a' : '#6b7280'} size={24} />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPayment === 'boleto' && styles.paymentOptionTextSelected,
                ]}>
                  Boleto Bancário
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === 'boleto' && styles.radioButtonSelected,
              ]}>
                {selectedPayment === 'boleto' && <View style={styles.radioButtonInner} />}
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
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 4,
    fontWeight: '500',
  },
  orderItemQuantity: {
    fontSize: 13,
    color: '#9ca3af',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  paymentOptionText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#1e3a8a',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
