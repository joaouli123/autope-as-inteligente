import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ShoppingCart, Star, MapPin, Package } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../services/supabaseClient';

const { width } = Dimensions.get('window');

type ProductScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Product'>;
type ProductScreenRouteProp = RouteProp<RootStackParamList, 'Product'>;

interface ProductDetails {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  images: string[];
  image_url?: string | null;
  category: string;
  part_code?: string | null;
  part_position?: string | null;
  brand?: string | null;
  model?: string | null;
  mpn?: string | null;
  oem_codes?: string[] | null;
  specifications?: Record<string, string>;
  store: {
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
}

export default function ProductScreen() {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [error, setError] = useState<string>('');

  const productId = route.params?.productId;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Produto inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const { data, error: productError } = await supabase
          .from('products')
          .select(
            'id, name, description, price, stock_quantity, images, image_url, category, part_code, part_position, brand, model, mpn, oem_codes, specifications, stores(name, city, state)'
          )
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        const images = Array.isArray(data.images) ? data.images : [];
        const normalizedImages = images.length > 0
          ? images
          : data.image_url
            ? [data.image_url]
            : [];

        setProduct({
          id: data.id,
          name: data.name,
          description: data.description,
          price: Number(data.price),
          stock_quantity: data.stock_quantity ?? 0,
          images: normalizedImages,
          image_url: data.image_url,
          category: data.category,
          part_code: data.part_code,
          part_position: data.part_position,
          brand: data.brand,
          model: data.model,
          mpn: data.mpn,
          oem_codes: Array.isArray(data.oem_codes) ? data.oem_codes : null,
          specifications: data.specifications || undefined,
          store: data.stores
            ? {
                name: data.stores.name,
                city: data.stores.city,
                state: data.stores.state,
              }
            : null,
        });
      } catch (err: any) {
        setError('Não foi possível carregar o produto.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const imageList = useMemo(() => product?.images || [], [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      description: product.store?.name || '',
      price: product.price,
      quantity: 1,
      brand: product.store?.name || '',
      partNumber: product.part_code || '',
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
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e3a8a" />
              <Text style={styles.loadingText}>Carregando produto...</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && product && (
            <>
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
              {imageList.length > 0 ? (
                imageList.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.productImage}
                  />
                ))
              ) : (
                <View style={styles.emptyImage}>
                  <Text style={styles.emptyImageText}>Imagem indisponível</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.pagination}>
              {imageList.map((_, index) => (
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
            <Text style={styles.category}>{product.category}</Text>

            {/* Title */}
            <Text style={styles.title}>{product.name}</Text>

            {/* Price */}
            <Text style={styles.price}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </Text>

            {/* Stock */}
            <View style={styles.stockBadge}>
              <Package size={16} color="#10b981" />
              <Text style={styles.stockText}>
                {product.stock_quantity} em estoque
              </Text>
            </View>

            {/* Store Info */}
            {product.store && (
              <View style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeIcon}>
                    <MapPin size={20} color="#1e3a8a" />
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{product.store.name}</Text>
                    <Text style={styles.storeAddress}>
                      {[product.store.city, product.store.state]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.description}>
                {product.description || 'Sem descrição cadastrada.'}
              </Text>
            </View>

            {/* Identification */}
            {(product.brand || product.model || product.part_code || product.part_position || product.mpn || (product.oem_codes && product.oem_codes.length > 0)) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identificação</Text>
                {product.brand && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Marca</Text>
                    <Text style={styles.specValue}>{product.brand}</Text>
                  </View>
                )}
                {product.model && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Modelo</Text>
                    <Text style={styles.specValue}>{product.model}</Text>
                  </View>
                )}
                {product.part_code && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Código da Peça</Text>
                    <Text style={styles.specValue}>{product.part_code}</Text>
                  </View>
                )}
                {product.part_position && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Posição</Text>
                    <Text style={styles.specValue}>{product.part_position}</Text>
                  </View>
                )}
                {product.mpn && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>MPN</Text>
                    <Text style={styles.specValue}>{product.mpn}</Text>
                  </View>
                )}
                {product.oem_codes && product.oem_codes.length > 0 && (
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>OEM</Text>
                    <Text style={styles.specValue}>{product.oem_codes.join(', ')}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especificações</Text>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={styles.specKey}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={!product}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
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
  emptyImage: {
    width: width,
    height: width,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImageText: {
    color: '#9ca3af',
    fontSize: 14,
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
