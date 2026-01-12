import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Car, Bike, Truck } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getBrands, getModels, type VehicleType, type FipeBrand, type FipeModel } from '../services/fipeService';

// Vehicle dropdown constants
const ENGINE_OPTIONS = ['1.0', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.4', '2.5', '3.0'];
const VALVE_OPTIONS = ['8v', '12v', '16v', '24v'];
const FUEL_OPTIONS = ['Flex', 'Gasolina', 'Diesel', 'Álcool', 'Elétrico', 'Híbrido'];
const TRANSMISSION_OPTIONS = ['Manual', 'Automático', 'CVT', 'Automatizado'];

type EditVehicleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditVehicle'>;

export default function EditVehicleScreen() {
  const navigation = useNavigation<EditVehicleScreenNavigationProp>();
  const { user, updateUser } = useAuth();

  const [vehicleType, setVehicleType] = useState<VehicleType>(user?.vehicle.type || 'carros');
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [models, setModels] = useState<FipeModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(user?.vehicle.brand || '');
  const [selectedModel, setSelectedModel] = useState(user?.vehicle.model || '');
  const [year, setYear] = useState(user?.vehicle.year || '');
  const [engine, setEngine] = useState(user?.vehicle.engine || '');
  const [valves, setValves] = useState(user?.vehicle.valves || '');
  const [fuel, setFuel] = useState(user?.vehicle.fuel || '');
  const [transmission, setTransmission] = useState(user?.vehicle.transmission || '');
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBrands = async (type: VehicleType) => {
    setLoadingBrands(true);
    const data = await getBrands(type);
    setBrands(data);
    setLoadingBrands(false);
  };

  const loadModels = async (brandCode: string) => {
    setLoadingModels(true);
    const data = await getModels(vehicleType, brandCode);
    setModels(data);
    setLoadingModels(false);
  };

  React.useEffect(() => {
    loadBrands(vehicleType);
  }, [vehicleType]);

  const handleSave = async () => {
    if (!selectedBrand || !selectedModel) {
      Alert.alert('Erro', 'Marca e Modelo são obrigatórios');
      return;
    }
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (!year.trim() || year.length !== 4 || yearNum < 1900 || yearNum > currentYear + 1) {
      Alert.alert('Erro', `Ano inválido (entre 1900 e ${currentYear + 1})`);
      return;
    }
    if (!engine || !valves || !fuel || !transmission) {
      Alert.alert('Erro', 'Preencha todos os campos do veículo');
      return;
    }

    setSaving(true);
    const success = await updateUser({
      vehicle: {
        type: vehicleType,
        brand: selectedBrand,
        model: selectedModel,
        year,
        engine,
        valves,
        fuel,
        transmission,
      },
    });
    setSaving(false);

    if (success) {
      Alert.alert('Sucesso', 'Veículo atualizado com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o veículo');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#1f2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Veículo</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Seu Veículo</Text>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, vehicleType === 'carros' && styles.tabActive]}
              onPress={() => {
                setVehicleType('carros');
                setSelectedBrand('');
                setSelectedModel('');
                loadBrands('carros');
              }}
            >
              <Car color={vehicleType === 'carros' ? '#ffffff' : '#1e3a8a'} size={20} />
              <Text style={[styles.tabText, vehicleType === 'carros' && styles.tabTextActive]}>
                Carros
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, vehicleType === 'motos' && styles.tabActive]}
              onPress={() => {
                setVehicleType('motos');
                setSelectedBrand('');
                setSelectedModel('');
                loadBrands('motos');
              }}
            >
              <Bike color={vehicleType === 'motos' ? '#ffffff' : '#1e3a8a'} size={20} />
              <Text style={[styles.tabText, vehicleType === 'motos' && styles.tabTextActive]}>
                Motos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, vehicleType === 'caminhoes' && styles.tabActive]}
              onPress={() => {
                setVehicleType('caminhoes');
                setSelectedBrand('');
                setSelectedModel('');
                loadBrands('caminhoes');
              }}
            >
              <Truck color={vehicleType === 'caminhoes' ? '#ffffff' : '#1e3a8a'} size={20} />
              <Text style={[styles.tabText, vehicleType === 'caminhoes' && styles.tabTextActive]}>
                Caminhões
              </Text>
            </TouchableOpacity>
          </View>

          {loadingBrands ? (
            <ActivityIndicator size="large" color="#1e3a8a" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowBrandPicker(!showBrandPicker)}
                >
                  <Text style={selectedBrand ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                    {selectedBrand || 'Selecione a Marca'}
                  </Text>
                </TouchableOpacity>
                {showBrandPicker && (
                  <ScrollView style={styles.pickerOptions} nestedScrollEnabled>
                    {brands.map((brand) => (
                      <TouchableOpacity
                        key={brand.codigo}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSelectedBrand(brand.nome);
                          setShowBrandPicker(false);
                          setSelectedModel('');
                          loadModels(brand.codigo);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{brand.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {loadingModels && <ActivityIndicator size="small" color="#1e3a8a" />}

              {models.length > 0 && (
                <View>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowModelPicker(!showModelPicker)}
                  >
                    <Text style={selectedModel ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                      {selectedModel || 'Selecione o Modelo'}
                    </Text>
                  </TouchableOpacity>
                  {showModelPicker && (
                    <ScrollView style={styles.pickerOptions} nestedScrollEnabled>
                      {models.map((model) => (
                        <TouchableOpacity
                          key={model.codigo}
                          style={styles.pickerOption}
                          onPress={() => {
                            setSelectedModel(model.nome);
                            setShowModelPicker(false);
                          }}
                        >
                          <Text style={styles.pickerOptionText}>{model.nome}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Ano (ex: 2020)"
                placeholderTextColor="#9ca3af"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />

              <View style={styles.row}>
                <View style={styles.inputSmall}>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      Alert.alert(
                        'Motor',
                        'Selecione o motor',
                        ENGINE_OPTIONS.map((e) => ({
                          text: e,
                          onPress: () => setEngine(e),
                        }))
                      );
                    }}
                  >
                    <Text style={engine ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                      {engine || 'Motor'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputSmall}>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      Alert.alert(
                        'Válvulas',
                        'Selecione as válvulas',
                        VALVE_OPTIONS.map((v) => ({
                          text: v,
                          onPress: () => setValves(v),
                        }))
                      );
                    }}
                  >
                    <Text style={valves ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                      {valves || 'Válvulas'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Combustível',
                    'Selecione o combustível',
                    FUEL_OPTIONS.map((f) => ({
                      text: f,
                      onPress: () => setFuel(f),
                    }))
                  );
                }}
              >
                <Text style={fuel ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                  {fuel || 'Combustível'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Câmbio',
                    'Selecione o câmbio',
                    TRANSMISSION_OPTIONS.map((t) => ({
                      text: t,
                      onPress: () => setTransmission(t),
                    }))
                  );
                }}
              >
                <Text style={transmission ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                  {transmission || 'Câmbio'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.buttonText}>
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  picker: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickerTextPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pickerTextSelected: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerOptions: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
});
