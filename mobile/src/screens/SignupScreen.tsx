import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Eye, EyeOff, Car, Bike, Truck } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validateCPForCNPJ } from '../utils/validators';
import { maskCPForCNPJ, maskPhone, maskCEP } from '../utils/masks';
import { fetchAddressByCEP } from '../services/cepService';
import { getBrands, getModels, type VehicleType, type FipeBrand, type FipeModel } from '../services/fipeService';
import ProgressBar from '../components/ProgressBar';

// Vehicle dropdown constants
const ENGINE_OPTIONS = ['1.0', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.4', '2.5', '3.0'];
const VALVE_OPTIONS = ['8v', '12v', '16v', '24v'];
const FUEL_OPTIONS = ['Flex', 'Gasolina', 'Diesel', 'Álcool', 'Elétrico', 'Híbrido'];
const TRANSMISSION_OPTIONS = ['Manual', 'Automático', 'CVT', 'Automatizado'];

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  
  // Step 1 - Personal Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 - Address
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepFilled, setCepFilled] = useState(false);

  // Step 3 - Vehicle
  const [vehicleType, setVehicleType] = useState<VehicleType>('carros');
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [models, setModels] = useState<FipeModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [valves, setValves] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleCEPBlur = async () => {
    if (cep.replace(/\D/g, '').length === 8) {
      setLoadingCEP(true);
      const data = await fetchAddressByCEP(cep);
      setLoadingCEP(false);
      
      if (data) {
        setStreet(data.logradouro);
        setCity(data.localidade);
        setState(data.uf);
        setCepFilled(true);
      } else {
        Alert.alert('Erro', 'CEP não encontrado');
        setCepFilled(false);
      }
    }
  };

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
    if (step === 3) {
      loadBrands(vehicleType);
    }
  }, [step, vehicleType]);

  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (!validateCPForCNPJ(cpfCnpj)) {
      Alert.alert('Erro', 'CPF/CNPJ inválido');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone inválido');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'CEP inválido');
      return false;
    }
    if (!street.trim()) {
      Alert.alert('Erro', 'Rua é obrigatória');
      return false;
    }
    if (!number.trim()) {
      Alert.alert('Erro', 'Número é obrigatório');
      return false;
    }
    if (!city.trim() || !state.trim()) {
      Alert.alert('Erro', 'Cidade e Estado são obrigatórios');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!selectedBrand || !selectedModel) {
      Alert.alert('Erro', 'Marca e Modelo são obrigatórios');
      return false;
    }
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (!year.trim() || year.length !== 4 || yearNum < 1900 || yearNum > currentYear + 1) {
      Alert.alert('Erro', `Ano inválido (entre 1900 e ${currentYear + 1})`);
      return false;
    }
    if (!engine || !valves || !fuel || !transmission) {
      Alert.alert('Erro', 'Preencha todos os campos do veículo');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    if (!validateStep3()) return;

    const userData = {
      name,
      email,
      cpfCnpj,
      phone,
      address: {
        cep,
        street,
        number,
        complement,
        city,
        state,
      },
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
    };

    const success = await signup(userData);
    if (success) {
      navigation.navigate('Main', { screen: 'Home' });
    }
  };

  const renderStep1 = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Seus Dados</Text>
      <ProgressBar steps={3} currentStep={1} />

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff color="#9ca3af" size={24} />
          ) : (
            <Eye color="#9ca3af" size={24} />
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="CPF/CNPJ"
        placeholderTextColor="#9ca3af"
        value={cpfCnpj}
        onChangeText={(text) => setCpfCnpj(maskCPForCNPJ(text))}
        keyboardType="numeric"
        maxLength={18}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor="#9ca3af"
        value={phone}
        onChangeText={(text) => setPhone(maskPhone(text))}
        keyboardType="phone-pad"
        maxLength={15}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Endereço</Text>
      <ProgressBar steps={3} currentStep={2} />

      <View style={styles.cepContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="CEP"
          placeholderTextColor="#9ca3af"
          value={cep}
          onChangeText={(text) => setCep(maskCEP(text))}
          onBlur={handleCEPBlur}
          keyboardType="numeric"
          maxLength={9}
        />
        {loadingCEP && <ActivityIndicator size="small" color="#1e3a8a" style={styles.loader} />}
      </View>

      <TextInput
        style={[styles.input, cepFilled && styles.inputReadonly]}
        placeholder="Rua"
        placeholderTextColor="#9ca3af"
        value={street}
        onChangeText={setStreet}
        editable={!cepFilled}
      />

      <TextInput
        style={styles.input}
        placeholder="Número"
        placeholderTextColor="#9ca3af"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Complemento (opcional)"
        placeholderTextColor="#9ca3af"
        value={complement}
        onChangeText={setComplement}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputSmall, cepFilled && styles.inputReadonly]}
          placeholder="Cidade"
          placeholderTextColor="#9ca3af"
          value={city}
          onChangeText={setCity}
          editable={!cepFilled}
        />
        <TextInput
          style={[styles.input, styles.inputTiny, cepFilled && styles.inputReadonly]}
          placeholder="UF"
          placeholderTextColor="#9ca3af"
          value={state}
          onChangeText={setState}
          maxLength={2}
          editable={!cepFilled}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Seu Veículo</Text>
      <ProgressBar steps={3} currentStep={3} />

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
                    ENGINE_OPTIONS.map(
                      (e) => ({
                        text: e,
                        onPress: () => setEngine(e),
                      })
                    )
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

          <TouchableOpacity style={[styles.button, styles.buttonFinish]} onPress={handleFinish}>
            <Text style={styles.buttonText}>Finalizar Cadastro</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}>
            <ArrowLeft color="#1f2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Conta</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  form: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
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
  },
  inputReadonly: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loader: {
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  inputTiny: {
    width: 80,
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
    marginTop: 4,
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
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonFinish: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  loginLink: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
});
