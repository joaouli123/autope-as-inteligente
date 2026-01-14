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
import { X, Car, ArrowUp, ArrowDown, Wrench, Gauge, BatteryCharging, Wind, Armchair, Droplet, Zap, Hammer, Settings, CircleDot, MoreHorizontal, Filter } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface FilterState {
  compatibilityGuaranteed: boolean;
  category: string;
  specifications: string[];
  priceMin: number;
  priceMax: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  partCode: string;
  partName: string;
  position: string;
  make: string;
  model: string;
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
  { id: 'Acessórios', name: 'Acessórios', icon: Wrench, specs: ['Vidros', 'Retrovisores', 'Parachoques', 'Paralamas'] },
  { id: 'Alinhamento e Balanceamento', name: 'Alinhamento', icon: Gauge, specs: ['Serviço', 'Peças'] },
  { id: 'Bateria', name: 'Bateria', icon: BatteryCharging, specs: ['45Ah', '60Ah', '70Ah', '100Ah'] },
  { id: 'Escapamento', name: 'Escapamento', icon: Wind, specs: ['Silencioso', 'Catalisador', 'Coletor', 'Intermediário'] },
  { id: 'Estofamento/Interior', name: 'Estofamento', icon: Armchair, specs: ['Bancos', 'Forração', 'Painel', 'Tapetes'] },
  { id: 'Lubrificantes', name: 'Lubrificantes', icon: Droplet, specs: ['Motor', 'Câmbio', 'Freio', 'Direção'] },
  { id: 'Elétrica/Injeção', name: 'Elétrica', icon: Zap, specs: ['Sensores', 'Módulos', 'Chicotes', 'Faróis'] },
  { id: 'Funilaria', name: 'Funilaria', icon: Hammer, specs: ['Lanternagem', 'Pintura', 'Metais', 'Solda'] },
  { id: 'Mecânica', name: 'Mecânica', icon: Settings, specs: ['Suspensão', 'Motor', 'Câmbio', 'Direção', 'Freios'] },
  { id: 'Pneus', name: 'Pneus', icon: CircleDot, specs: ['Aro 13', 'Aro 14', 'Aro 15', 'Aro 16', 'Aro 17'] },
  { id: 'Outros', name: 'Outros', icon: MoreHorizontal, specs: [] },
];

const POSITIONS = [
  { value: 'dianteiro_direito', label: 'Dianteiro Direito' },
  { value: 'dianteiro_esquerdo', label: 'Dianteiro Esquerdo' },
  { value: 'traseiro_direito', label: 'Traseiro Direito' },
  { value: 'traseiro_esquerdo', label: 'Traseiro Esquerdo' },
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
      partCode: '',
      partName: '',
      position: '',
      make: '',
      model: '',
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

          {/* Part Code Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Busca por Código da Peça</Text>
            <TextInput
              style={styles.textInput}
              value={localFilters.partCode}
              onChangeText={(text) => setLocalFilters({ ...localFilters, partCode: text })}
              placeholder="Ex: KL1045008"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Part Name Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Busca por Nome da Peça</Text>
            <TextInput
              style={styles.textInput}
              value={localFilters.partName}
              onChangeText={(text) => setLocalFilters({ ...localFilters, partName: text })}
              placeholder="Ex: Amortecedor"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>
              Busca inteligente por primeiras letras
            </Text>
          </View>

          {/* Position Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posição da Peça</Text>
            <View style={styles.positionContainer}>
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos.value}
                  style={[
                    styles.positionButton,
                    localFilters.position === pos.value && styles.positionButtonActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      position: localFilters.position === pos.value ? '' : pos.value,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.positionButtonText,
                      localFilters.position === pos.value && styles.positionButtonTextActive,
                    ]}
                  >
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      localFilters.category === category.id && styles.categoryCardActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Icon 
                      color={localFilters.category === category.id ? "#ffffff" : "#1e3a8a"} 
                      size={28} 
                    />
                    <Text
                      style={[
                        styles.categoryCardText,
                        localFilters.category === category.id && styles.categoryCardTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Specifications for selected category */}
            {localFilters.category && (
              <>
                {(() => {
                  const selectedCategory = CATEGORIES.find(c => c.id === localFilters.category);
                  if (!selectedCategory || !selectedCategory.specs.length) return null;
                  
                  return (
                    <View style={styles.specsContainer}>
                      <Text style={styles.specsTitle}>Especificações</Text>
                      <View style={styles.specsChipsWrapper}>
                        {selectedCategory.specs.map((spec) => (
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
                    </View>
                  );
                })()}
              </>
            )}
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.priceHeader}>
              <Text style={styles.sectionTitle}>Preço Máximo</Text>
              <Text style={styles.priceRange}>
                R$ {localFilters.priceMax}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5000}
              step={50}
              value={localFilters.priceMax}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, priceMax: value })
              }
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#d1d5db"
              thumbTintColor="#3b82f6"
            />
            <View style={styles.priceLabels}>
              <Text style={styles.priceLabelText}>R$ 0</Text>
              <Text style={styles.priceLabelText}>R$ 5.000+</Text>
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
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  positionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  positionButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  positionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  positionButtonTextActive: {
    color: '#ffffff',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriesScroll: {
    paddingVertical: 8,
    gap: 12,
  },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  categoryCardActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  categoryCardText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  categoryCardTextActive: {
    color: '#ffffff',
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
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  specsChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  slider: {
    width: '100%',
    height: 40,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceLabelText: {
    fontSize: 12,
    color: '#6b7280',
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
