import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ShoppingCart, Star, MapPin, Package } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');

type ProductScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Product'>;
type ProductScreenRouteProp = RouteProp<RootStackParamList, 'Product'>;

// Mock product data
// TODO: Move to centralized mock data service and fetch from Supabase in production
const mockProduct = {
  id: '1',
  name: 'Pastilha de Freio Dianteira Cerâmica',
  description: 'Pastilha de freio de alta performance com composto cerâmico. Reduz ruídos e proporciona frenagem suave e eficiente.',
  price: 145.90,
  stock: 50,
  images: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
  ],
  category: 'Freios',
  specifications: {
    tipo: 'Cerâmica',
    posicao: 'Dianteira',
    compatibilidade: 'Chevrolet Onix 2016-2022',
    garantia: '1 ano',
  },
  store: {
    name: 'Auto Peças Central',
    rating: 4.8,
    totalReviews: 152,
    address: 'São Paulo, SP',
  },
};

export default function ProductScreen() {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    addToCart({
      id: mockProduct.id,
      name: mockProduct.name,
      description: mockProduct.store.name,
      price: mockProduct.price,
      quantity: 1,
      brand: mockProduct.store.name,
      partNumber: 'MOCK-001',
    });
    navigation.navigate('Main', { screen: 'Cart' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
          >
            <ShoppingCart color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Images */}
          <View style={styles.imagesContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {mockProduct.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.productImage}
                />
              ))}
            </ScrollView>
            <View style={styles.pagination}>
              {mockProduct.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Category */}
            <Text style={styles.category}>{mockProduct.category}</Text>

            {/* Title */}
            <Text style={styles.title}>{mockProduct.name}</Text>

            {/* Price */}
            <Text style={styles.price}>
              R$ {mockProduct.price.toFixed(2).replace('.', ',')}
            </Text>

            {/* Stock */}
            <View style={styles.stockBadge}>
              <Package size={16} color="#10b981" />
              <Text style={styles.stockText}>
                {mockProduct.stock} em estoque
              </Text>
            </View>

            {/* Store Info */}
            <View style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={styles.storeIcon}>
                  <MapPin size={20} color="#1e3a8a" />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{mockProduct.store.name}</Text>
                  <Text style={styles.storeAddress}>
                    {mockProduct.store.address}
                  </Text>
                </View>
              </View>
              <View style={styles.storeRating}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.ratingText}>
                  {mockProduct.store.rating.toFixed(1)}
                </Text>
                <Text style={styles.reviewsText}>
                  ({mockProduct.store.totalReviews} avaliações)
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.description}>{mockProduct.description}</Text>
            </View>

            {/* Specifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Especificações</Text>
              {Object.entries(mockProduct.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart color="#ffffff" size={20} />
            <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#f3f4f6',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  paginationDotActive: {
    backgroundColor: '#1e3a8a',
    width: 24,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  storeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reviewsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  specKey: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
