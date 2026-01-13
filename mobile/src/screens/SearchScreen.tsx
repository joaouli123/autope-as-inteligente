import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Filter, X, ShoppingBag } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';

// Interface
interface Product {
  id: string;
  name: string;
  price: number;
  store: string;
  image: string;
  category: string;
}

// Dados mockados
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
];

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);

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
    // CORREÇÃO 1: O Wrapper geral é CINZA
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* CORREÇÃO 2: O Header é uma View separada que contém APENAS o título/subtítulo */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Buscar Peças</Text>
            <Text style={styles.headerSubtitle}>
              Encontre a peça perfeita para seu veículo
            </Text>
          </View>
          {/* Avatar simulado (opcional, como na imagem) */}
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>JL</Text>
          </View>
        </View>
      </View>

      {/* CORREÇÃO 3: A Barra de busca vem DEPOIS do header fechar */}
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

      {/* Lista de Resultados */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Fundo CINZA da tela
  },
  header: {
    backgroundColor: '#1e3a8a', // Fundo AZUL apenas no topo
    paddingHorizontal: 20,
    paddingBottom: 80,
    marginBottom: -30, // Espaço extra para a barra de busca "subir"
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
    marginTop: -30, // TRUQUE: Puxa a barra para cima do azul
    marginBottom: 10,
    zIndex: 10, // Garante que a barra fique "em cima" visualmente
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
  },
  listContent: {

    paddingHorizontal: 20,
    paddingTop: 10,
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
