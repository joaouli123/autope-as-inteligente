import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  TextInput,
} from 'react-native';
import { X, ChevronDown, Filter, Sliders } from 'lucide-react-native';

interface FilterState {
  compatibilityGuaranteed: boolean;
  category: string;
  specifications: string[];
  priceMin: number;
  priceMax: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  userVehicle?: {
    brand: string;
    model: string;
    year: number;
  };
}

const CATEGORIES = [
  { id: 'Freios', name: 'Freios', specs: ['Dianteiro', 'Traseiro', 'Cerâmica', 'Metálica', 'Orgânica'] },
  { id: 'Motor', name: 'Motor', specs: ['Filtro', 'Velas', 'Bobina', 'Sensor', 'Correia'] },
  { id: 'Suspensão', name: 'Suspensão', specs: ['Amortecedor', 'Mola', 'Barra', 'Cubo', 'Bandeja'] },
  { id: 'Elétrica', name: 'Elétrica', specs: ['12V', '24V', 'Bateria', 'Alternador', 'Motor de Partida'] },
  { id: 'Transmissão', name: 'Transmissão', specs: ['Embreagem', 'Cabo', 'Óleo', 'Rolamento'] },
  { id: 'Filtros', name: 'Filtros', specs: ['Óleo', 'Ar', 'Combustível', 'Cabine', 'Transmissão'] },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mais Relevantes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'newest', label: 'Mais Recentes' },
];

export default function AdvancedFilterModal({
  visible,
  onClose,
  filters,
  onApply,
  userVehicle,
}: AdvancedFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleClear = () => {
    setLocalFilters({
      compatibilityGuaranteed: false,
      category: '',
      specifications: [],
      priceMin: 0,
      priceMax: 5000,
      sortBy: 'relevance',
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    // Only one category can be selected at a time
    setLocalFilters(prev => ({
      ...prev,
      category: prev.category === categoryId ? '' : categoryId,
      specifications: [], // Clear specs when changing category
    }));
  };

  const toggleSpecification = (spec: string) => {
    setLocalFilters(prev => ({
      ...prev,
      specifications: prev.specifications.includes(spec)
        ? prev.specifications.filter(s => s !== spec)
        : [...prev.specifications, spec],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Filter color="#1f2937" size={24} />
            <Text style={styles.headerTitle}>Filtros Avançados</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#1f2937" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Compatibility Guarantee Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Compatibilidade Garantida</Text>
                {userVehicle && (
                  <Text style={styles.toggleSubtitle}>
                    {userVehicle.brand} {userVehicle.model} {userVehicle.year}
                  </Text>
                )}
                {!userVehicle && (
                  <Text style={styles.toggleWarning}>
                    Cadastre seu veículo para usar este filtro
                  </Text>
                )}
              </View>
              <Switch
                value={localFilters.compatibilityGuaranteed}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, compatibilityGuaranteed: value })
                }
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={localFilters.compatibilityGuaranteed ? '#ffffff' : '#f3f4f6'}
                disabled={!userVehicle}
              />
            </View>
            {localFilters.compatibilityGuaranteed && (
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityBadgeText}>
                  ✓ Mostrando apenas peças compatíveis com seu veículo
                </Text>
              </View>
            )}
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.chipsContainer}>
              {CATEGORIES.map((category) => (
                <View key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      localFilters.category === category.id && styles.chipActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.category === category.id && styles.chipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Specifications for selected category */}
                  {localFilters.category === category.id && category.specs.length > 0 && (
                    <View style={styles.specsContainer}>
                      {category.specs.map((spec) => (
                        <TouchableOpacity
                          key={spec}
                          style={[
                            styles.specChip,
                            localFilters.specifications.includes(spec) &&
                              styles.specChipActive,
                          ]}
                          onPress={() => toggleSpecification(spec)}
                        >
                          <Text
                            style={[
                              styles.specChipText,
                              localFilters.specifications.includes(spec) &&
                                styles.specChipTextActive,
                            ]}
                          >
                            {spec}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.priceHeader}>
              <Text style={styles.sectionTitle}>Faixa de Preço</Text>
              <Text style={styles.priceRange}>
                R$ {localFilters.priceMin} - R$ {localFilters.priceMax}
              </Text>
            </View>
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceInputLabel}>Mín</Text>
                <TextInput
                  style={styles.priceInput}
                  value={localFilters.priceMin.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    setLocalFilters({
                      ...localFilters,
                      priceMin: value,
                    });
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <Text style={styles.priceSeparator}>até</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceInputLabel}>Máx</Text>
                <TextInput
                  style={styles.priceInput}
                  value={localFilters.priceMax.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 5000;
                    setLocalFilters({
                      ...localFilters,
                      priceMax: value,
                    });
                  }}
                  keyboardType="numeric"
                  placeholder="5000"
                />
              </View>
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordenar Por</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  localFilters.sortBy === option.value && styles.sortOptionActive,
                ]}
                onPress={() => setLocalFilters({ ...localFilters, sortBy: option.value as FilterState['sortBy'] })}
              >
                <View
                  style={[
                    styles.radio,
                    localFilters.sortBy === option.value && styles.radioActive,
                  ]}
                >
                  {localFilters.sortBy === option.value && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.sortOptionText,
                    localFilters.sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  toggleWarning: {
    fontSize: 12,
    color: '#ef4444',
  },
  compatibilityBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  compatibilityBadgeText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginLeft: 12,
  },
  specChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  specChipText: {
    fontSize: 12,
    color: '#6b7280',
  },
  specChipTextActive: {
    color: '#1e40af',
    fontWeight: '500',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  sortOptionTextActive: {
    color: '#1e40af',
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
