import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  StatusBar,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Filter, X, ShoppingBag } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import { supabase } from '../../services/supabaseClient';

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  price: number;
  store: string;
  image: string;
  category: string;
}

// Mock de segurança (caso a internet falhe)
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
  const insets = useSafeAreaInsets();
  
  // --- Estados Consolidados ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
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

  // --- Função de Formatação (Recuperada) ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // --- Contagem de Filtros Ativos ---
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.compatibilityGuaranteed) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    return count;
  };

  // --- Efeitos (Carregamento de Dados) ---
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
        if (data) setUserVehicle(data);
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
        .select(`*, stores!inner(name), product_compatibility(*)`)
        .eq('is_active', true);

      // Filtro de Busca Texto
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      // Filtro de Categoria
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      // Filtro de Preço
      query = query
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);

      // Ordenação
      switch (filters.sortBy) {
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('sales_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filtro de Compatibilidade (Feito em memória pois é complexo)
      let products = data || [];
      if (filters.compatibilityGuaranteed && userVehicle) {
        products = products.filter((product: any) => {
          const compatibilities = product.product_compatibility || [];
          return compatibilities.some((comp: any) => {
            if (!comp.brand || !comp.model) return false;
            const brandMatch = comp.brand.toLowerCase() === userVehicle.brand.toLowerCase();
            const modelMatch = comp.model.toLowerCase() === userVehicle.model.toLowerCase();
            const yearMatch = userVehicle.year >= comp.year_start && (!comp.year_end || userVehicle.year <= comp.year_end);
            return brandMatch && modelMatch && yearMatch;
          });
        });
      }

      setFilteredProducts(products.length > 0 ? products : []); 
    } catch (error) {
      console.error('Error loading products:', error);
      if (filteredProducts.length === 0) setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  // --- Ações da UI ---
  const handleApplyFilters = (newFilters: FilterOptions) => setFilters(newFilters);
  const handleSearch = (query: string) => setSearchQuery(query);
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { productId: item.id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productStore}>{item.store}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Header Azul (Visual Correto) */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Buscar Peças</Text>
            <Text style={styles.headerSubtitle}>
              Encontre a peça perfeita para seu veículo
            </Text>
          </View>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>JL</Text>
          </View>
        </View>
      </View>

      {/* Barra de Busca + Botão de Filtro (Posição Correta) */}
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
        
        {/* Botão de Filtro Inteligente (Muda de cor se tiver filtro ativo) */}
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

      {/* Lista de Resultados Otimizada */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() === '' ? 'Todos os produtos' : 'Resultados encontrados'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShoppingBag color="#9ca3af" size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            </View>
          }
        />
      )}

      {/* Modal de Filtros */}
      <AdvancedFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={handleApplyFilters}
        userVehicle={userVehicle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingBottom: 80, // Altura ajustada
    marginBottom: -30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxWidth: 250,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -30, // Faz a barra subir
    marginBottom: 10,
    zIndex: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  filterButton: {
    width: 50,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6', // Fica azul quando tem filtro
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productCategory: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  productStore: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});