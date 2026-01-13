import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ListRenderItem,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Filter, X } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';

// Mock types
interface Product {
  id: string;
  name: string;
  price: number;
  store: string;
  image: string;
  category: string;
}

// Mock products
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pastilha de Freio Dianteira Cerâmica',
    price: 145.90,
    store: 'Auto Peças Central',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    category: 'Freios',
  },
  {
    id: '2',
    name: 'Filtro de Óleo Original',
    price: 35.90,
    store: 'Auto Peças Central',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    category: 'Óleo e Filtros',
  },
  {
    id: '3',
    name: 'Amortecedor Traseiro Esportivo',
    price: 389.90,
    store: 'Performance Parts',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    category: 'Suspensão',
  },
  {
    id: '4',
    name: 'Kit Embreagem Completo',
    price: 650.00,
    store: 'Auto Peças Premium',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
    category: 'Transmissão',
  },
  {
    id: '5',
    name: 'Bateria 60Ah Livre de Manutenção',
    price: 425.50,
    store: 'Baterias Express',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    category: 'Elétrica',
  },
  {
    id: '6',
    name: 'Jogo de Velas de Ignição Premium',
    price: 89.90,
    store: 'Auto Peças Central',
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400',
    category: 'Motor',
  },
  {
    id: '7',
    name: 'Disco de Freio Ventilado Par',
    price: 285.00,
    store: 'Freios & Suspensão',
    image: 'https://images.unsplash.com/photo-1614359952095-8b2ac2043e0d?w=400',
    category: 'Freios',
  },
  {
    id: '8',
    name: 'Radiador de Alumínio Reforçado',
    price: 520.00,
    store: 'Refrigeração Auto',
    image: 'https://images.unsplash.com/photo-1625047508850-1f3c0d67d9fd?w=400',
    category: 'Arrefecimento',
  },
];

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const insets = useSafeAreaInsets(); // Hook for dynamic safe area
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);

  // Formatting helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts(mockProducts);
    } else {
      const filtered = mockProducts.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredProducts(mockProducts);
    Keyboard.dismiss();
  };

  // Render Item for FlatList
  const renderProductItem: ListRenderItem<Product> = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { productId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productStore}>{item.store}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      {/* Dynamic Header padding based on device insets */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Buscar Peças</Text>
        <Text style={styles.headerSubtitle}>
          Encontre a peça perfeita para seu veículo
        </Text>
      </View>

      {/* Search Bar - Positioned absolutely or via negative margin */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#9ca3af" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque por peça ou sintoma..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X color="#6b7280" size={20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#1e3a8a" size={20} />
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.resultsContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() === '' ? 'Todos os produtos' : 'Resultados da busca'}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Changed to light gray for better contrast with list
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingBottom: 70, // Space for the overlapping search bar
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
    fontSize: 14,
    color: '#d1d5db',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -40, // Negative margin to overlap header
    marginBottom: 10,
    zIndex: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    width: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 10,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productStore: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
});
