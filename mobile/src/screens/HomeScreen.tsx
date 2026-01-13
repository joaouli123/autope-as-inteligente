import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Search,
  MapPin,
  Car,
  Edit2,
  Sparkles,
  ChevronRight,
  Disc,
  Droplet,
  Activity,
  Zap,
  Settings,
  BatteryCharging,
} from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AutoPeças AI</Text>
            <View style={styles.locationRow}>
              <MapPin color="#ffffff" size={16} />
              <Text style={styles.locationText}>São Paulo, SP</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>JL</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#9ca3af" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque por peça ou sintoma..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Vehicle Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Car color="#1e3a8a" size={24} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleLabel}>SEU VEÍCULO</Text>
            <Text style={styles.vehicleName}>Chevrolet Onix</Text>
            <Text style={styles.vehicleDetails}>• 2020 1.0 12v</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Edit2 color="#ffffff" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Buscar Peças</Text>
          </TouchableOpacity>
        </View>

        {/* AI Diagnostic Card - COMMENTED OUT FOR NOW */}
        {/* 
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Sparkles color="#fbbf24" size={24} />
            <Text style={styles.aiTitle}>Diagnóstico Inteligente</Text>
          </View>
          <Text style={styles.aiDescription}>
            Descreva o problema e nossa IA encontra a peça certa para você.
          </Text>
          <TouchableOpacity style={styles.aiExampleButton}>
            <Text style={styles.aiExampleText}>Ex: "Carro engasgando"</Text>
            <ChevronRight color="#9ca3af" size={20} />
          </TouchableOpacity>
        </View>
        */}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <CategoryButton icon={Disc} label="Freios" />
            <CategoryButton icon={Droplet} label="Óleo" />
            <CategoryButton icon={Activity} label="Suspensão" />
            <CategoryButton icon={Zap} label="Elétrica" />
            <CategoryButton icon={Settings} label="Motor" />
            <CategoryButton icon={BatteryCharging} label="Bateria" />
          </ScrollView>
        </View>

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populares</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          {/* Product cards aqui */}
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface CategoryButtonProps {
  icon: React.ComponentType<any>;
  label: string;
}

function CategoryButton({ icon: Icon, label }: CategoryButtonProps) {
  return (
    <TouchableOpacity style={styles.categoryButton}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon color="#1e3a8a" size={32} />
        <Text style={styles.categoryLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1e3a8a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 140,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  locationText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  vehicleCard: {
    backgroundColor: '#1e3a8a',
    marginHorizontal: 20,
    marginTop: 40,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 11,
    color: '#93c5fd',
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  aiCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aiDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
    lineHeight: 20,
  },
  aiExampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  aiExampleText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    width: 90,
    height: 90,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
});
