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
import { ArrowLeft } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validators';
import { maskPhone, maskCEP } from '../utils/masks';
import { fetchAddressByCEP } from '../services/cepService';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cep, setCep] = useState(user?.address.cep || '');
  const [street, setStreet] = useState(user?.address.street || '');
  const [number, setNumber] = useState(user?.address.number || '');
  const [complement, setComplement] = useState(user?.address.complement || '');
  const [city, setCity] = useState(user?.address.city || '');
  const [state, setState] = useState(user?.address.state || '');
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepFilled, setCepFilled] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone inválido');
      return;
    }
    if (cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'CEP inválido');
      return;
    }
    if (!street.trim() || !number.trim() || !city.trim() || !state.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos de endereço');
      return;
    }

    setSaving(true);
    const success = await updateUser({
      name,
      email,
      phone,
      address: {
        cep,
        street,
        number,
        complement,
        city,
        state,
      },
    });
    setSaving(false);

    if (success) {
      Alert.alert('Sucesso', 'Dados atualizados com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
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
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

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

          <TextInput
            style={[styles.input, styles.inputReadonly]}
            placeholder="CPF/CNPJ"
            placeholderTextColor="#9ca3af"
            value={user.cpfCnpj}
            editable={false}
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

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Endereço</Text>

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

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
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
  inputReadonly: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
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
