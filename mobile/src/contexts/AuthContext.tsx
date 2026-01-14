import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Vehicle {
  type: 'carros' | 'motos' | 'caminhoes';
  brand: string;
  model: string;
  year: string;
  engine: string;
  valves: string;
  fuel: string;
  transmission: string;
}

export interface UserProfile {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  };
  vehicle: Vehicle;
}

interface AuthContextData {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: UserProfile, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: UserProfile) => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Helper function to map vehicle data from database to UserProfile vehicle
const mapVehicleData = (vehicleData: any): Vehicle => {
  return {
    type: 'carros', // Default to carros for now, can be extended later
    brand: vehicleData.brand,
    model: vehicleData.model,
    year: vehicleData.year.toString(),
    engine: vehicleData.engine || '',
    valves: vehicleData.valves ? vehicleData.valves.toString() : '',
    fuel: vehicleData.fuel_type || '',
    transmission: '',
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Iniciando login...');
      
      // 1. Autenticar no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Erro de login:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] Usuário não encontrado');
        return false;
      }

      console.log('[AuthContext] Login bem-sucedido:', data.user.id);

      // 2. Carregar perfil do usuário (se existir na tabela users ou outra)
      // Por enquanto, criar perfil básico
      const userProfile: UserProfile = {
        name: data.user.email?.split('@')[0] || 'Usuário',
        email: data.user.email || '',
        cpfCnpj: '',
        phone: '',
        address: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          city: '',
          state: '',
        },
        vehicle: {
          type: 'carros',
          brand: '',
          model: '',
          year: '',
          engine: '',
          valves: '',
          fuel: '',
          transmission: '',
        },
      };

      // 3. Carregar veículo do usuário
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('user_vehicles')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_primary', true)
        .single();

      if (vehicleData) {
        console.log('[AuthContext] Veículo carregado:', vehicleData);
        userProfile.vehicle = mapVehicleData(vehicleData);
      }

      setUser(userProfile);
      return true;
    } catch (error) {
      console.error('[AuthContext] Erro inesperado no login:', error);
      return false;
    }
  };

  const signup = async (userData: UserProfile, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Iniciando cadastro...');

      // 1. Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
      });

      if (error) {
        console.error('[AuthContext] Erro ao criar usuário:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] Usuário não foi criado');
        return false;
      }

      console.log('[AuthContext] Usuário criado:', data.user.id);

      // 2. Salvar veículo do usuário em user_vehicles
      if (userData.vehicle && userData.vehicle.brand && userData.vehicle.model) {
        console.log('[AuthContext] Salvando veículo...');
        
        const { error: vehicleError } = await supabase
          .from('user_vehicles')
          .insert({
            user_id: data.user.id,
            brand: userData.vehicle.brand,
            model: userData.vehicle.model,
            year: parseInt(userData.vehicle.year),
            engine: userData.vehicle.engine || null,
            valves: userData.vehicle.valves ? parseInt(userData.vehicle.valves) : null,
            fuel_type: userData.vehicle.fuel || null,
            is_primary: true,
          });

        if (vehicleError) {
          console.error('[AuthContext] Erro ao salvar veículo:', vehicleError.message);
          // Não falha o cadastro, apenas loga o erro
        } else {
          console.log('[AuthContext] Veículo salvo com sucesso!');
        }
      }

      // 3. Fazer login automático após cadastro
      setUser(userData);
      console.log('[AuthContext] Cadastro completo!');
      return true;
    } catch (error) {
      console.error('[AuthContext] Erro inesperado no cadastro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Fazendo logout...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('[AuthContext] Logout concluído');
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
    }
  };

  const updateProfile = (userData: UserProfile) => {
    setUser(userData);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<boolean> => {
    if (user) {
      // Deep merge for nested objects
      const updatedUser = {
        ...user,
        ...userData,
        address: userData.address ? { ...user.address, ...userData.address } : user.address,
        vehicle: userData.vehicle ? { ...user.vehicle, ...userData.vehicle } : user.vehicle,
      };
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  // Carregar sessão existente ao iniciar
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('[AuthContext] Sessão encontrada:', session.user.id);
        
        // Carregar dados do usuário
        const userProfile: UserProfile = {
          name: session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          cpfCnpj: '',
          phone: '',
          address: {
            cep: '',
            street: '',
            number: '',
            complement: '',
            city: '',
            state: '',
          },
          vehicle: {
            type: 'carros',
            brand: '',
            model: '',
            year: '',
            engine: '',
            valves: '',
            fuel: '',
            transmission: '',
          },
        };

        // Carregar veículo
        const { data: vehicleData } = await supabase
          .from('user_vehicles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_primary', true)
          .single();

        if (vehicleData) {
          userProfile.vehicle = mapVehicleData(vehicleData);
        }

        setUser(userProfile);
      }
    };

    loadSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
