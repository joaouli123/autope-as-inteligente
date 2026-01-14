import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
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

interface FilterState {
  compatibilityGuaranteed: boolean;
  category: string;
  specifications: string[];
  priceMin: number;
  priceMax: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  // --- Estados Consolidados ---
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userVehicle, setUserVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
   
  const [filters, setFilters] = useState<FilterState>({
    compatibilityGuaranteed:  false,
    category: '',
    specifications: [],
    priceMin: 0,
    priceMax: 5000,
    sortBy: 'relevance',
  });

  // --- Função de Formatação ---
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
    if (filters.category) count++;
    if (filters.specifications.length > 0) count += filters.specifications.length;
    if (filters.priceMin > 0 || filters.priceMax < 5000) count++;
    return count;
  };

  // --- Efeitos (Carregamento de Dados) ---
  useEffect(() => {
    loadUserVehicle();
    loadAllProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, allProducts]);

  const loadUserVehicle = async () => {
    try {
      const { data:  { user } } = await supabase. auth.getUser();
      if (user) {
        const { data } = await supabase
          . from('user_vehicles')
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

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, stores! inner(name), product_compatibility(*)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setAllProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // 1. Busca por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // 2. Compatibilidade Garantida
    if (filters. compatibilityGuaranteed && userVehicle) {
      filtered = filtered.filter((product:  any) => {
        const compatibilities = product.product_compatibility || [];
        return compatibilities.some((comp: any) => {
          if (! comp.brand || !comp.model) return false;
          const brandMatch = comp.brand.toLowerCase() === userVehicle.brand. toLowerCase();
          const modelMatch = comp.model.toLowerCase() === userVehicle.model.toLowerCase();
          const yearMatch = userVehicle.year >= comp.year_start && (! comp.year_end || userVehicle.year <= comp.year_end);
          return brandMatch && modelMatch && yearMatch;
        });
      });
    }

    // 3. Categoria
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // 4. Especificações
    if (filters.specifications. length > 0) {
      filtered = filtered.filter((p: any) => {
        const productSpecs = p.specifications?.[filters.category] || [];
        return filters.specifications.some(spec => 
          productSpecs.includes(spec)
        );
      });
    }

    // 5. Faixa de Preço
    filtered = filtered.filter(p =>
      p.price >= filters. priceMin && p.price <= filters.priceMax
    );

    // 6. Ordenação
    switch (filters.sortBy) {
      case 'price_asc':
        filtered. sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered. sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a:  any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  // --- Ações da UI ---
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  const handleSearch = (query: string) => setSearchQuery(query);
  
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          
          {/* ===== HEADER AZUL COM BORDAS ARREDONDADAS ===== */}
          <View style={styles.headerBlue}>
            <Text style={styles.headerTitle}>Buscar Peças</Text>
            <Text style={styles.headerSubtitle}>
              Encontre a peça perfeita para seu veículo
            </Text>

            {/* Barra de Pesquisa + Botão Filtro */}
            <View style={styles. searchRow}>
              <View style={styles.searchContainer}>
                <Search color="#9ca3af" size={20} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Busque por peça ou sintoma..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery. length > 0 && (
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
          </View>

          {/* ===== CONTEÚDO BRANCO ===== */}
          <View style={styles.contentWhite}>
            <Text style={styles.sectionTitle}>
              {filteredProducts.length} produtos encontrados
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e3a8a" />
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productCard}
                    onPress={() => navigation.navigate('Product', { productId: item. id })}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item. image || 'https://via.placeholder.com/80' }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productCategory}>{item. category}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.productStore}>{item.store}</Text>
                      <Text style={styles.productPrice}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <ShoppingBag color="#9ca3af" size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
                    <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
                  </View>
                }
              />
            )}
          </View>

          {/* Modal de Filtros */}
          <AdvancedFilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onApply={handleApplyFilters}
            userVehicle={userVehicle}
          />

        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== HEADER AZUL =====
  headerBlue: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom:  30,
    marginTop: -60,
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
    fontSize:  14,
    color: '#93c5fd',
    marginBottom:  20,
  },

  // ===== BARRA DE PESQUISA + FILTRO =====
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical:  10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon:  {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color:  '#1f2937',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width:  0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation:  3,
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

  // ===== CONTEÚDO BRANCO =====
  contentWhite: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom:  16,
  },

  // ===== CARDS DE PRODUTOS =====
  listContent: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage:  {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productStore: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  loadingContainer: {
    flex:  1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize:  16,
  },
});
