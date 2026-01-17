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
  Platform,
  StatusBar,
} from 'react-native';
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  part_position?: string;
  productImageWrap: {
    width: 74,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  productImageFallbackText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  product_name: string;
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  part_position: string | null;
  productCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
}
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    name: 'Pastilha de Freio Dianteira Cerâmica',
  productStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productStore: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  productRatingText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
    store: 'Auto Peças Central',
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
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
  sortBy: 'price_asc' | 'price_desc';
  partCode: string;
  partName: string;
  partPosition: string;
  make: string;
  model: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
   
  const [filters, setFilters] = useState<FilterState>({
    compatibilityGuaranteed: false,
    category: '',
    specifications: [],
    priceMin: 0,
    priceMax: 5000,
    sortBy: 'price_asc',
    partCode: '',
    partName: '',
    partPosition: '',
    make: '',
    model: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.compatibilityGuaranteed) count++;
    if (filters.category) count++;
    if (filters.specifications.length > 0) count += filters.specifications.length;
    if (filters.priceMin > 0 || filters.priceMax < 5000) count++;
    return count;
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  // Reload products when user vehicle changes
  useEffect(() => {
    if (user?.vehicle) {
      console.log('[SearchScreen] Vehicle changed, reloading products...');
      loadAllProducts();
      setFilters(f => ({ ...f, compatibilityGuaranteed: true }));
    }
  }, [user?.vehicle]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, allProducts]);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      // Get current user from auth context
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('[SearchScreen] No user found, using mock products');
        setAllProducts(mockProducts);
        return;
      }

      // Use RPC function to get products with compatibility check
      // Note: We pass null for category and price here because client-side filtering
      // is applied in applyFilters() which respects the filters state
      const { data, error } = await supabase.rpc('get_products_for_user_vehicle', {
        p_user_id: authUser.id,
        p_category: null, // Get all categories, filter client-side
        p_max_price: null, // Get all prices, filter client-side
      });

      if (error) {
        console.error('[SearchScreen] Error loading products from RPC:', error);
        setAllProducts(mockProducts);
        return;
      }

      // Transform RPC response to Product interface
      const products: Product[] = (data || []).map((item: ProductRPCResponse) => ({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        store: item.store_name,
        image: item.image_url || 'https://via.placeholder.com/80',
        category: item.category,
        part_code: item.part_code || undefined,
        part_position: item.part_position || undefined,
        is_compatible: item.is_compatible,
      }));

      console.log('[SearchScreen] Loaded', products.length, 'products from RPC');
      setAllProducts(products);
    } catch (error) {
      console.error('[SearchScreen] Unexpected error loading products:', error);
      setAllProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // 1. Search by part code (EXACT match)
    if (filters.partCode.trim()) {
      filtered = filtered.filter(p => 
        p.part_code?.toLowerCase() === filters.partCode.toLowerCase()
      );
    }

    // 2. Search by part name with prefix matching
    if (filters.partName.trim()) {
      const searchTerm = filters.partName.toLowerCase();
      filtered = filtered.filter(p => {
        const productName = p.name.toLowerCase();
        // Search by 7, 6, 5, 4, 3, 2 first letters
        for (let i = Math.min(7, searchTerm.length); i >= 2; i--) {
          if (productName.startsWith(searchTerm.substring(0, i))) {
            return true;
          }
        }
        return false;
      });
    }

    // 3. Filter by part position
    if (filters.partPosition) {
      filtered = filtered.filter(p => p.part_position === filters.partPosition);
    }

    // 4. Filter by compatibility (using DB-provided is_compatible flag)
    if (filters.compatibilityGuaranteed && user?.vehicle) {
      filtered = filtered.filter(p => p.is_compatible === true);
    }

    // 5. Filter by category
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // 6. Filter by specifications (not implemented in RPC yet, keeping for future)
    if (filters.specifications.length > 0) {
      filtered = filtered.filter((p: any) => {
        const productSpecs = p.specifications?.[filters.category] || [];
        return filters.specifications.some(spec => 
          productSpecs.includes(spec)
        );
      });
    }

    // 7. Filter by price range
    filtered = filtered.filter(p =>
      p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // 8. Sort by price
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  const handleSearch = (query: string) => setSearchQuery(query);
  
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          
          <View style={styles.headerBlue}>
            <Text style={styles.headerTitle}>Buscar Peças</Text>
            <Text style={styles.headerSubtitle}>
              Encontre a peça perfeita para seu veículo
            </Text>

            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Search color="#9ca3af" size={20} style={styles.searchIcon} />
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
          </View>

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
                    onPress={() => navigation.navigate('Product', { productId: item.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.productImageWrap}>
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.productImage}
                        />
                      ) : (
                        <View style={styles.productImageFallback}>
                          <Text style={styles.productImageFallbackText}>Img Indisponível</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.productCategoryPill}>
                        <Text style={styles.productCategoryText}>
                          {item.category?.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.productStoreRow}>
                        <Text style={styles.productStore}>{item.store}</Text>
                        <View style={styles.productRating}>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} size={12} color="#fbbf24" fill="#fbbf24" />
                          ))}
                          <Text style={styles.productRatingText}>(4.9)</Text>
                        </View>
                      </View>

                      <Text style={styles.productPrice}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          description: item.store,
                          price: item.price,
                          quantity: 1,
                          brand: item.store,
                          partNumber: item.part_code || '',
                        })
                      }
                    >
                      <Plus color="#ffffff" size={20} />
                    </TouchableOpacity>
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

          <AdvancedFilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onApply={handleApplyFilters}
            userVehicle={user?.vehicle ? {
              brand: user.vehicle.brand,
              model: user.vehicle.model,
              year: user.vehicle.year,
              engine: user.vehicle.engine || undefined,
              valves: user.vehicle.valves || undefined,
              fuel: user.vehicle.fuel || undefined,
            } : undefined}
          />

        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerBlue: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#93c5fd',
    marginBottom: 20,
  },
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
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    width: 52,
    height: Platform.OS === 'ios' ? 42 : 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
  contentWhite: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginTop: -40,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productImage: {
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
