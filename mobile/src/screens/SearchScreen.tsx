import React, { useState, useEffect } from 'react';
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
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import { supabase } from '../services/supabaseClient';

// Constants
const STATUS_BAR_HEIGHT = 60;

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

interface FilterOptions {
  compatibilityGuaranteed: boolean;
  categories: string[];
  priceRange: { min: number; max: number };
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  specifications: { [key: string]: string[] };
}

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userVehicle, setUserVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    compatibilityGuaranteed: false,
    categories: [],
    priceRange: { min: 0, max: 10000 },
    sortBy: 'relevance',
    specifications: {},
  });

  useEffect(() => {
    loadUserVehicle();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, searchQuery]);

  const loadUserVehicle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('user_vehicles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();
        
        if (data) {
          setUserVehicle(data);
        }
      }
    } catch (error) {
      console.error('Error loading user vehicle:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          stores!inner(name),
          product_compatibility(*)
        `)
        .eq('is_active', true);

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Apply price filter
      query = query
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);

      // Apply compatibility filter
      if (filters.compatibilityGuaranteed && userVehicle) {
        // This requires a more complex query - we need to check product_compatibility
        // For now, we'll filter in memory after fetching
        // In production, you'd want to use a Postgres function for this
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('sales_count', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply compatibility filter in memory if needed
      let products = data || [];
      
      if (filters.compatibilityGuaranteed && userVehicle) {
        products = products.filter((product: any) => {
          const compatibilities = product.product_compatibility || [];
          
          return compatibilities.some((comp: any) => {
            if (!comp.brand || !comp.model || !userVehicle.brand || !userVehicle.model) {
              return false;
            }
            
            const brandMatch = comp.brand.toLowerCase() === userVehicle.brand.toLowerCase();
            const modelMatch = comp.model.toLowerCase() === userVehicle.model.toLowerCase();
            const yearMatch = 
              userVehicle.year >= comp.year_start &&
              (!comp.year_end || userVehicle.year <= comp.year_end);
            
            return brandMatch && modelMatch && yearMatch;
          });
        });
      }

      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data on error
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.compatibilityGuaranteed) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    return count;
  };

  return (
    <View style={styles.wrapper}>
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
          <TouchableOpacity 
            style={[styles.filterButton, activeFiltersCount() > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter color={activeFiltersCount() > 0 ? "#ffffff" : "#1e3a8a"} size={20} />
            {activeFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount()}</Text>
              </View>
            )}
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

        {/* Advanced Filter Modal */}
        <AdvancedFilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onApply={handleApplyFilters}
          userVehicle={userVehicle}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT,
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
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
