import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Filter, X } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';

// Mock products (depois vem do Supabase)
// TODO: Move mock data to a centralized mock data service for better maintainability
const mockProducts = [
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

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
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header azul arredondado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Buscar Peças</Text>
          <Text style={styles.headerSubtitle}>
            Encontre a peça perfeita para seu veículo
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color="#9ca3af" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Busque por peça ou sintoma..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearch}
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

        {/* Results */}
        <ScrollView 
          style={styles.results}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() === '' ? 'Todos os produtos' : 'Buscar Produtos'}
          </Text>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhum produto encontrado
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('Product', { productId: product.id })}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productStore}>{product.store}</Text>
                  <Text style={styles.productPrice}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 70,
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
    marginTop: -40,
    marginBottom: 20,
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
    height: 50,
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
  results: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
    backgroundColor: '#f3f4f6',
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
