import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, UserRole, Order, OrderStatus, Vehicle, AddressData } from '../types';
import { POPULAR_VEHICLES } from '../services/mockData';
import { Product } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  handleLogin: (role: UserRole, products: Product[]) => void;
  handleLogout: (resetProducts: Product[]) => void;
  signupStep: number;
  setSignupStep: React.Dispatch<React.SetStateAction<number>>;
  authForm: AuthFormData;
  setAuthForm: React.Dispatch<React.SetStateAction<AuthFormData>>;
  isLoadingAddress: boolean;
  setIsLoadingAddress: React.Dispatch<React.SetStateAction<boolean>>;
  profileForm: ProfileFormData;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isEditingProfile: boolean;
  setIsEditingProfile: React.Dispatch<React.SetStateAction<boolean>>;
  showProfileVehicleEdit: boolean;
  setShowProfileVehicleEdit: React.Dispatch<React.SetStateAction<boolean>>;
  showCheckoutAddressEdit: boolean;
  setShowCheckoutAddressEdit: React.Dispatch<React.SetStateAction<boolean>>;
  tempAddress: AddressData | null;
  setTempAddress: React.Dispatch<React.SetStateAction<AddressData | null>>;
}

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [signupStep, setSignupStep] = useState(1);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [authForm, setAuthForm] = useState<AuthFormData>({ 
    name: '', email: '', password: '', cpfCnpj: '', phone: '', 
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '', email: '', cpfCnpj: '', phone: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showProfileVehicleEdit, setShowProfileVehicleEdit] = useState(false);
  const [showCheckoutAddressEdit, setShowCheckoutAddressEdit] = useState(false);
  const [tempAddress, setTempAddress] = useState<AddressData | null>(null);

  const handleLogin = (role: UserRole, products: Product[]) => {
    let mockUser: UserProfile = {
      name: 'Usuário Demo',
      role: role,
      email: authForm.email || 'demo@autopecas.com',
      orders: [],
      vehicle: null
    };

    if (role === 'CONSUMER') {
      const pastOrder: Order = {
        id: 'PED-998',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: OrderStatus.COMPLETED,
        total: 150.00,
        shippingCost: 15.00,
        paymentMethod: 'credit_card_machine',
        addressSnapshot: 'Av. Paulista, 1000 - SP',
        items: [{ ...products[0] || {} as Product, quantity: 1 }]
      };
      mockUser = {
        ...mockUser,
        name: 'Motorista Carlos',
        vehicle: POPULAR_VEHICLES[0],
        orders: [pastOrder],
        addressDetails: {
           cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: '',
           neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP'
        },
        cpfCnpj: '123.456.789-00',
        phone: '(11) 99999-9999'
      };
    } else if (role === 'SELLER') {
      mockUser = { ...mockUser, name: 'Loja Auto Peças Central', storeId: 's1', cpfCnpj: '12.345.678/0001-99' };
    } else if (role === 'ADMIN') {
      mockUser = { ...mockUser, name: 'Super Admin' };
    }
    setUser(mockUser);
  };

  const handleLogout = (resetProducts: Product[]) => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    setUser,
    handleLogin,
    handleLogout,
    signupStep,
    setSignupStep,
    authForm,
    setAuthForm,
    isLoadingAddress,
    setIsLoadingAddress,
    profileForm,
    setProfileForm,
    isEditingProfile,
    setIsEditingProfile,
    showProfileVehicleEdit,
    setShowProfileVehicleEdit,
    showCheckoutAddressEdit,
    setShowCheckoutAddressEdit,
    tempAddress,
    setTempAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
