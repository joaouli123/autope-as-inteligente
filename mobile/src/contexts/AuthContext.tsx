import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Vehicle {
  id?: string;
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
  id: string;
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
  vehicle: Vehicle | null;
}

interface AuthContextData {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: UserProfile, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: UserProfile) => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente ao iniciar
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Buscar dados do usuário (futuro: criar tabela profiles)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return;

      // Buscar veículo primário do usuário
      const { data: vehicleData } = await supabase
        .from('user_vehicles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      let vehicle: Vehicle | null = null;
      if (vehicleData) {
        vehicle = {
          id: vehicleData.id,
          type: 'carros',
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year.toString(),
          engine: vehicleData.engine || '',
          valves: vehicleData.valves?.toString() || '',
          fuel: vehicleData.fuel_type || '',
          transmission: 'Manual',
        };
      }

      const userProfile: UserProfile = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        cpfCnpj: authUser.user_metadata?.cpfCnpj || '',
        phone: authUser.user_metadata?.phone || '',
        address: {
          cep: authUser.user_metadata?.cep || '',
          street: authUser.user_metadata?.street || '',
          number: authUser.user_metadata?.number || '',
          complement: authUser.user_metadata?.complement || '',
          city: authUser.user_metadata?.city || '',
          state: authUser.user_metadata?.state || '',
        },
        vehicle,
      };

      setUser(userProfile);
      console.log('[AuthContext] Perfil carregado:', userProfile);
    } catch (error) {
      console.error('[AuthContext] Erro ao carregar perfil:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Tentando login com:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Erro no login:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] Usuário não encontrado');
        return false;
      }

      console.log('[AuthContext] Login bem-sucedido! User ID:', data.user.id);
      await loadUserProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('[AuthContext] Erro inesperado no login:', error);
      return false;
    }
  };

  const signup = async (userData: UserProfile, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Criando conta para:', userData.email);

      // 1. Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
        options: {
          data: {
            name: userData.name,
            cpfCnpj: userData.cpfCnpj,
            phone: userData.phone,
            cep: userData.address.cep,
            street: userData.address.street,
            number: userData.address.number,
            complement: userData.address.complement,
            city: userData.address.city,
            state: userData.address.state,
          },
        },
      });

      if (error) {
        console.error('[AuthContext] Erro ao criar conta:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] Usuário não foi criado');
        return false;
      }

      console.log('[AuthContext] Conta criada! User ID:', data.user.id);

      // 2. Salvar veículo (se fornecido)
      if (userData.vehicle) {
        console.log('[AuthContext] Salvando veículo do usuário...');
        
        const { error: vehicleError } = await supabase
          .from('user_vehicles')
          .insert({
            user_id: data.user.id,
            brand: userData.vehicle.brand,
            model: userData.vehicle.model,
            year: parseInt(userData.vehicle.year),
            engine: userData.vehicle.engine,
            valves: parseInt(userData.vehicle.valves) || null,
            fuel_type: userData.vehicle.fuel,
            is_primary: true,
          });

        if (vehicleError) {
          console.error('[AuthContext] Erro ao salvar veículo:', vehicleError.message);
        } else {
          console.log('[AuthContext] Veículo salvo com sucesso!');
        }
      }

      // 3. Fazer login automaticamente
      await loadUserProfile(data.user.id);
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
      console.error('[AuthContext] Erro no logout:', error);
    }
  };

  const updateProfile = (userData: UserProfile) => {
    setUser(userData);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
