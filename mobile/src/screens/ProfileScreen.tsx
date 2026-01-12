import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Car, LogOut, Trash2, Edit } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do app?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Splash');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar Conta',
      'Esta ação é irreversível. Deseja realmente deletar sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Splash');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>Usuário não encontrado</Text>
      </View>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Perfil</Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Personal Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            <View style={styles.card}>
              <DataRow label="Nome" value={user.name} />
              <DataRow label="E-mail" value={user.email} />
              <DataRow label="CPF/CNPJ" value={user.cpfCnpj} />
              <DataRow label="Telefone" value={user.phone} last />
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <View style={styles.card}>
              <DataRow
                label="Rua"
                value={`${user.address.street}, ${user.address.number}`}
              />
              {user.address.complement && (
                <DataRow label="Complemento" value={user.address.complement} />
              )}
              <DataRow
                label="Cidade"
                value={`${user.address.city} - ${user.address.state}`}
              />
              <DataRow label="CEP" value={user.address.cep} last />
            </View>
          </View>

          {/* Vehicle Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seu Veículo</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIcon}>
                <Car color="#1e3a8a" size={24} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>
                  {user.vehicle.type === 'carros' ? 'CARRO' : 
                   user.vehicle.type === 'motos' ? 'MOTO' : 'CAMINHÃO'}
                </Text>
                <Text style={styles.vehicleName}>
                  {user.vehicle.brand} {user.vehicle.model}
                </Text>
                <Text style={styles.vehicleDetails}>
                  • {user.vehicle.year} {user.vehicle.engine} {user.vehicle.valves}
                </Text>
                <Text style={styles.vehicleDetails}>
                  • {user.vehicle.fuel} • {user.vehicle.transmission}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.buttonEdit}
              onPress={() => Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento')}
            >
              <Edit color="#ffffff" size={20} />
              <Text style={styles.buttonEditText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
              <LogOut color="#6b7280" size={20} />
              <Text style={styles.buttonLogoutText}>Sair do App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonDelete} onPress={handleDeleteAccount}>
              <Trash2 color="#ef4444" size={20} />
              <Text style={styles.buttonDeleteText}>Deletar Conta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>AutoPeças IA v1.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  last?: boolean;
}

function DataRow({ label, value, last }: DataRowProps) {
  return (
    <View style={[styles.dataRow, !last && styles.dataRowBorder]}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  noUserText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    backgroundColor: '#1e3a8a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dataRow: {
    paddingVertical: 12,
  },
  dataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  vehicleCard: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 2,
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  buttonEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonEditText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonLogoutText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDeleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
