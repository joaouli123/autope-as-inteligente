import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  TextInput,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Car, ArrowUp, ArrowDown, Wrench, Gauge, BatteryCharging, Wind, Armchair, Droplet, Zap, Hammer, Settings, CircleDot, MoreHorizontal, Filter } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { PART_POSITION_OPTIONS } from '../constants/parts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

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

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  userVehicle?: {
    brand: string;
    model: string;
    year: number;
    engine?: string;
    valves?: number;
    fuel?: string;
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

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
];

// Helper function to clean model name by removing engine/valves/fuel/doors patterns
const cleanModelName = (modelName: string): string => {
  let cleaned = modelName;
  
  // Remove engine patterns with word boundaries (e.g., " 1.0 ", " 1.6 ", " 2.0 ")
  cleaned = cleaned.replace(/\s+\d+\.\d+\s+/g, ' ');
  
  // Remove valves patterns with word boundaries (e.g., "8V", "12V", "16V", "24V")
  cleaned = cleaned.replace(/\s+(8|12|16|20|24)\s*V\b/gi, '');
  
  // Remove fuel type patterns with word boundaries
  cleaned = cleaned.replace(/\s+(Flex|Gasolina|Diesel|Álcool|Etanol|Elétrico|Híbrido|Gas\.|Alc\.)\b/gi, '');
  
  // Remove doors patterns (e.g., "2p", "4p") with word boundaries
  cleaned = cleaned.replace(/\s+\d+p\b/gi, '');
  
  // Remove common engine tech terms with word boundaries
  cleaned = cleaned.replace(/\s+(Mi|Turbo|TSI|TDI|TFSI|GTI)\b/gi, '');
  
  // Remove "Total" when followed by space (commonly "Total Flex")
  cleaned = cleaned.replace(/\s+Total\s+/gi, ' ');
  
  // Clean up extra spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// Helper function to format vehicle information display
const formatVehicleInfo = (vehicle: {
  brand: string;
  model: string;
  year: number;
  engine?: string;
  valves?: number;
  fuel?: string;
}): string => {
  // Clean the model name for display
  const cleanedModel = cleanModelName(vehicle.model);
  const brandModel = `${vehicle.brand.toUpperCase()} ${cleanedModel.toUpperCase()} / ${vehicle.year}`;
  
  // Build engine info string
  const engineParts: string[] = [];
  if (vehicle.engine) {
    engineParts.push(vehicle.engine);
  }
  if (vehicle.valves) {
    engineParts.push(`${vehicle.valves}V`);
  }
  const engineInfo = engineParts.length > 0 ? engineParts.join(' ') : '';
  
  // Build full info string
  const parts = [brandModel];
  if (engineInfo) {
    parts.push(engineInfo);
  }
  if (vehicle.fuel) {
    parts.push(vehicle.fuel);
  }
  
  return parts.join(' • ');
};

export default function AdvancedFilterModal({
  visible,
  onClose,
  filters,
  onApply,
  userVehicle,
}: AdvancedFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  // Sync localFilters with parent filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    }
  }, [visible]);

  // Auto-activate compatibility toggle when userVehicle exists
  useEffect(() => {
    if (userVehicle && visible) {
      setLocalFilters(prev => ({
        ...prev,
        compatibilityGuaranteed: true,
      }));
    }
  }, [userVehicle, visible]);

  const handleClose = () => {
    // Trigger animation, then close
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleClear = () => {
    setLocalFilters({
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
  };

  const handleApply = () => {
    onApply(localFilters);
    handleClose();
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Dark backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: opacityAnim }
            ]} 
          />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Filter color="#1f2937" size={24} />
              <Text style={styles.headerTitle}>Filtros Avançados</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color="#1f2937" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Compatibility Box - Blue informative (no toggle) */}
            {userVehicle && (
              <View style={styles.section}>
                <View style={styles.blueBox}>
                  <View style={styles.boxInfo}>
                    <Text style={styles.blueBoxTitle}>✓ Compatibilidade garantida</Text>
                    <Text style={styles.blueBoxVehicle}>
                      {formatVehicleInfo(userVehicle)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2. Part Name Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nome da peça</Text>
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

            {/* 3. Part Code Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Código da peça <Text style={styles.optionalLabel}>(Opcional)</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={localFilters.partCode}
                onChangeText={(text) => setLocalFilters({ ...localFilters, partCode: text })}
                placeholder="Ex: KL1045008"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* 4. Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Categoria <Text style={styles.optionalLabel}>(Opcional)</Text>
              </Text>
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

              {/* 5. Specifications for selected category */}
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

            {/* 6. Position Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Posição <Text style={styles.optionalLabel}>(Opcional)</Text>
              </Text>
              <View style={styles.positionContainer}>
                {PART_POSITION_OPTIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos.value}
                    style={[
                      styles.positionButton,
                      localFilters.partPosition === pos.value && styles.positionButtonActive,
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        partPosition: localFilters.partPosition === pos.value ? '' : pos.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.positionButtonText,
                        localFilters.partPosition === pos.value && styles.positionButtonTextActive,
                      ]}
                    >
                      {pos.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 7. Price Range */}
            <View style={styles.section}>
              <View style={styles.priceHeader}>
                <Text style={styles.sectionTitle}>Preço máximo</Text>
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

            {/* 8. Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordenar por</Text>
              <View style={styles.sortContainer}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      localFilters.sortBy === option.value && styles.sortButtonActive,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, sortBy: option.value as FilterState['sortBy'] })}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        localFilters.sortBy === option.value && styles.sortButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bottom padding for scrolling */}
            <View style={{ height: 20 }} />
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: '#9ca3af',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
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
  optionalLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
  },
  greenBox: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  greenBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 6,
  },
  greenBoxVehicle: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  blueBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  boxInfo: {
    flex: 1,
  },
  blueBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  blueBoxVehicle: {
    fontSize: 13,
    color: '#1e3a8a',
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
  sortContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  sortButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
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
    backgroundColor: '#1e3a8a',
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
