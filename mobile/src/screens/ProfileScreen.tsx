import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Car, LogOut, Trash2, Edit2, ArrowLeft, FileText, MapPin, Camera, Image as ImageIcon } from 'lucide-react-native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type NavigateToEditProfile = () => void;
type NavigateToEditVehicle = () => void;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const navigateToEditProfile: NavigateToEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  const navigateToEditVehicle: NavigateToEditVehicle = () => {
    navigation.navigate('EditVehicle' as any);
  };

  useEffect(() => {
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_avatar');
      if (saved) setAvatarUri(saved);
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const saveAvatar = async (uri: string) => {
    try {
      await AsyncStorage.setItem('user_avatar', uri);
      setAvatarUri(uri);
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    setShowAvatarModal(false);

    if (source === 'camera') {
      const { status } = await ImagePicker. requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar a câmera');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar a galeria');
        return;
      }
    }

    const result = await (source === 'camera'
      ? ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality:  0.5,
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        }));

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && 'size' in fileInfo) {
          const size = fileInfo.size as number;
          if (size > 5 * 1024 * 1024) {
            Alert.alert('Erro', 'Imagem muito grande!  Máximo 5MB.');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking file size:', error);
      }

      await saveAvatar(uri);
    }
  };

  const handleRemoveAvatar = async () => {
    setShowAvatarModal(false);
    try {
      await AsyncStorage.removeItem('user_avatar');
      setAvatarUri(null);
    } catch (error) {
      console.error('Error removing avatar:', error);
    }
  };

  const getInitials = () => {
    const name = user?.name || 'User';
    return name
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do app?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress:  () => {
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
      'Esta ação é irreversível. Deseja realmente deletar sua conta? ',
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

  return (
    <>
      {/* ✅ StatusBar com fundo azul */}
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* ✅ Container externo CINZA (não azul!) */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <SafeAreaView style={styles. container} edges={['bottom']}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ✅ Header AZUL com bordas arredondadas */}
            <View style={styles.headerBlue}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft color="#ffffff" size={24} />
              </TouchableOpacity>
              <Text style={styles. headerTitle}>Voltar</Text>
            </View>

            {/* ✅ Avatar SOBREPOSTO no header (fora do header azul) */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => setShowAvatarModal(true)}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                )}
                <View style={styles.avatarEditIcon}>
                  <Camera color="#ffffff" size={16} />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>{user.name}</Text>
            </View>

            {/* ✅ Conteúdo BRANCO */}
            <View style={styles.contentWrapper}>
              {/* Personal Data Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <FileText color="#1e3a8a" size={24} />
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={navigateToEditProfile}
                  >
                    <Edit2 color="#1e3a8a" size={20} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles. infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF/CNPJ</Text>
                  <Text style={styles. infoValue}>{user.cpfCnpj}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>

              {/* Address Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <MapPin color="#1e3a8a" size={24} />
                    <Text style={styles.sectionTitle}>Endereço</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={navigateToEditProfile}
                  >
                    <Edit2 color="#1e3a8a" size={20} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles. infoLabel}>Rua</Text>
                  <Text style={styles.infoValue}>
                    {user.address. street}, {user.address.number}
                  </Text>
                </View>
                {user.address.complement && (
                  <View style={styles.infoRow}>
                    <Text style={styles. infoLabel}>Complemento</Text>
                    <Text style={styles.infoValue}>{user.address.complement}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cidade</Text>
                  <Text style={styles. infoValue}>
                    {user.address. city} - {user.address.state}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles. infoLabel}>CEP</Text>
                  <Text style={styles.infoValue}>{user.address.cep}</Text>
                </View>
              </View>

              {/* Vehicle Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Car color="#1e3a8a" size={24} />
                    <Text style={styles.sectionTitle}>Seu Veículo</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={navigateToEditVehicle}
                  >
                    <Edit2 color="#1e3a8a" size={20} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.vehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <Car color="#ffffff" size={32} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {user.vehicle.brand} {user.vehicle.model}
                    </Text>
                    <Text style={styles.vehicleDetails}>
                      {user.vehicle.year} • {user.vehicle.engine} • {user.vehicle.valves}
                    </Text>
                    <Text style={styles.vehicleDetails}>
                      {user.vehicle.fuel} • {user.vehicle.transmission}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Sair do App</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Deletar Conta</Text>
              </TouchableOpacity>

              {/* Footer */}
              <Text style={styles.footer}>AutoPeças IA v1.0</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Modal Avatar */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Foto do Perfil</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePickImage('camera')}
            >
              <Camera color="#1e3a8a" size={24} />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePickImage('gallery')}
            >
              <ImageIcon color="#1e3a8a" size={24} />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            {avatarUri && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleRemoveAvatar}
              >
                <Trash2 color="#ef4444" size={24} />
                <Text style={[styles.modalOptionText, { color: '#ef4444' }]}>
                  Remover Foto
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  noUserText: {
    fontSize: 16,
    color:  '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  headerBlue: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -80,  // ✅ Sobrepõe no header azul
    marginBottom: 24,
    zIndex: 10,
  },
  avatar:  {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right:  0,
    backgroundColor: '#1e3a8a',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName:  {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop:  12,
  },
  contentWrapper: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  vehicleCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vehicleIconContainer:  {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
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
  },
  logoutButton: {
    backgroundColor:  '#6b7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize:  16,
    fontWeight:  '600',
  },
  deleteButton: {
    backgroundColor:  'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize:  14,
    marginTop: 40,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor:  '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical:  16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical:  16,
    alignItems: 'center',
  },
  modalCancelText:  {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});
