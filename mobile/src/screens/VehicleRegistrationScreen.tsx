import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Car, Save, Search } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../services/supabaseClient';
import { getBrands, getModels, getYears, type FipeItem, type FipeYear } from '../services/fipeService';
import { getVehicleByPlate, decodeVIN } from '../services/brasilApiService';

type VehicleRegistrationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VehicleRegistration'
>;

export default function VehicleRegistrationScreen() {
  const navigation = useNavigation<VehicleRegistrationScreenNavigationProp>();
  
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);
  
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingPlate, setLoadingPlate] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoadingBrands(true);
    const data = await getBrands('carros');
    setBrands(data);
    setLoadingBrands(false);
  };

  const loadModels = async (brandId: string) => {
    setLoadingModels(true);
    const data = await getModels('carros', brandId);
    setModels(data);
    setLoadingModels(false);
  };

  const loadYears = async (brandId: string, modelId: string) => {
    setLoadingYears(true);
    const data = await getYears('carros', brandId, modelId);
    setYears(data);
    setLoadingYears(false);
  };

  const handleBrandSelect = (brand: FipeItem) => {
    setSelectedBrandId(brand.codigo);
    setSelectedBrand(brand.nome);
    setSelectedModel('');
    setSelectedModelId('');
    setSelectedYear('');
    setShowBrandModal(false);
    loadModels(brand.codigo);
  };

  const handleModelSelect = (model: FipeItem) => {
    setSelectedModelId(model.codigo);
    setSelectedModel(model.nome);
    setSelectedYear('');
    setShowModelModal(false);
    loadYears(selectedBrandId, model.codigo);
  };

  const handleYearSelect = (year: FipeYear) => {
    setSelectedYear(year.nome);
    setShowYearModal(false);
  };

  const handleLicensePlateLookup = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Erro', 'Digite a placa do veículo');
      return;
    }

    setLoadingPlate(true);
    try {
      const vehicleData = await getVehicleByPlate(licensePlate);
      
      if (vehicleData) {
        Alert.alert(
          'Veículo Encontrado',
          'Os dados do veículo foram preenchidos automaticamente. Verifique e complete as informações.',
          [{ text: 'OK' }]
        );
        
        // Auto-fill data if available
        if (vehicleData.brand) setSelectedBrand(vehicleData.brand);
        if (vehicleData.model) setSelectedModel(vehicleData.model);
        if (vehicleData.year) setSelectedYear(vehicleData.year);
      } else {
        Alert.alert(
          'Aviso',
          'Não foi possível consultar a placa. Preencha os dados manualmente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error looking up plate:', error);
      Alert.alert('Erro', 'Falha ao consultar placa. Preencha manualmente.');
    } finally {
      setLoadingPlate(false);
    }
  };

  const handleSave = async () => {
    if (!selectedBrand || !selectedModel || !selectedYear) {
      Alert.alert('Erro', 'Preencha marca, modelo e ano do veículo');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const vehicleData = {
        user_id: user.id,
        brand: selectedBrand,
        model: selectedModel,
        year: parseInt(selectedYear.split('-')[0]) || parseInt(selectedYear),
        engine: engine || null,
        transmission: transmission || null,
        fuel_type: fuelType || null,
        license_plate: licensePlate.toUpperCase() || null,
        vin: vin.toUpperCase() || null,
        is_primary: true, // First vehicle is primary
      };

      // Check if user has primary vehicle
      const { data: existingVehicles } = await supabase
        .from('user_vehicles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true);

      if (existingVehicles && existingVehicles.length > 0) {
        vehicleData.is_primary = false; // Don't override existing primary
      }

      const { error } = await supabase
        .from('user_vehicles')
        .insert(vehicleData);

      if (error) throw error;

      Alert.alert(
        'Sucesso',
        'Veículo cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Erro', 'Falha ao cadastrar veículo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#1f2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Veículo</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* License Plate Lookup */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Car color="#3b82f6" size={24} />
              <Text style={styles.cardTitle}>Consulta por Placa</Text>
            </View>
            <Text style={styles.cardDescription}>
              Digite a placa do veículo para buscar automaticamente os dados
            </Text>
            
            <View style={styles.plateContainer}>
              <TextInput
                style={styles.plateInput}
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="ABC-1234"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleLicensePlateLookup}
                disabled={loadingPlate}
              >
                {loadingPlate ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Search color="#ffffff" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Information */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informações do Veículo</Text>

            {/* Brand */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Marca *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowBrandModal(true)}
                disabled={loadingBrands}
              >
                <Text style={selectedBrand ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                  {selectedBrand || 'Selecione a marca'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Model */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Modelo *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowModelModal(true)}
                disabled={!selectedBrandId || loadingModels}
              >
                <Text style={selectedModel ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                  {selectedModel || 'Selecione o modelo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Year */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Ano *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowYearModal(true)}
                disabled={!selectedModelId || loadingYears}
              >
                <Text style={selectedYear ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                  {selectedYear || 'Selecione o ano'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Engine */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Motor</Text>
              <TextInput
                style={styles.input}
                value={engine}
                onChangeText={setEngine}
                placeholder="Ex: 1.0, 1.6, 2.0"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Transmission */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Transmissão</Text>
              <TextInput
                style={styles.input}
                value={transmission}
                onChangeText={setTransmission}
                placeholder="Ex: Manual, Automática"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Fuel Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Combustível</Text>
              <TextInput
                style={styles.input}
                value={fuelType}
                onChangeText={setFuelType}
                placeholder="Ex: Flex, Gasolina, Diesel"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* VIN */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Chassi (VIN)</Text>
              <TextInput
                style={styles.input}
                value={vin}
                onChangeText={setVin}
                placeholder="17 caracteres"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                maxLength={17}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Save color="#ffffff" size={20} />
                <Text style={styles.saveButtonText}>Cadastrar Veículo</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Brand Modal */}
        <Modal visible={showBrandModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione a Marca</Text>
                <TouchableOpacity onPress={() => setShowBrandModal(false)}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.codigo}
                    style={styles.modalItem}
                    onPress={() => handleBrandSelect(brand)}
                  >
                    <Text style={styles.modalItemText}>{brand.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Model Modal */}
        <Modal visible={showModelModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Modelo</Text>
                <TouchableOpacity onPress={() => setShowModelModal(false)}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {models.map((model) => (
                  <TouchableOpacity
                    key={model.codigo}
                    style={styles.modalItem}
                    onPress={() => handleModelSelect(model)}
                  >
                    <Text style={styles.modalItemText}>{model.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Year Modal */}
        <Modal visible={showYearModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Ano</Text>
                <TouchableOpacity onPress={() => setShowYearModal(false)}>
                  <Text style={styles.modalClose}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year.codigo}
                    style={styles.modalItem}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={styles.modalItemText}>{year.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  plateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  plateInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectButton: {
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectButtonPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  input: {
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
});
