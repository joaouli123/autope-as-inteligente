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

// Database vehicle data structure
interface DbVehicleData {
  brand: string;
  model: string;
  year: number;
  engine: string | null;
  valves: number | null;
  fuel_type: string | null;
  transmission: string | null;
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

// Helper function to map vehicle data from database to UserProfile vehicle
const mapVehicleData = (vehicleData: DbVehicleData): Vehicle => {
  return {
    type: 'carros', // Default to carros for now, can be extended later
    brand: vehicleData.brand,
    model: vehicleData.model,
    year: vehicleData.year.toString(),
    engine: vehicleData.engine || '',
    valves: vehicleData.valves ? vehicleData.valves.toString() : '',
    fuel: vehicleData.fuel_type || '',
    transmission: vehicleData.transmission || '',
  };
};

// Helper function to create empty user profile
const createEmptyUserProfile = (userId: string, email: string, name?: string): UserProfile => {
  return {
    id: userId,
    name: name || email.split('@')[0] || 'Usuário',
    email: email,
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
    vehicle: null,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to load user's primary vehicle
  const loadUserVehicle = async (userId: string): Promise<Vehicle | null> => {
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('user_vehicles')
        .select('brand, model, year, engine, valves, fuel_type, transmission')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is acceptable
        console.error('[AuthContext] Error loading vehicle:', vehicleError.message);
        return null;
      }

      if (vehicleData) {
        console.log('[AuthContext] Vehicle loaded:', vehicleData);
        return mapVehicleData(vehicleData);
      }

      return null;
    } catch (error) {
      console.error('[AuthContext] Unexpected error loading vehicle:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Starting login...');
      
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Login error:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] User not found');
        return false;
      }

      console.log('[AuthContext] Login successful:', data.user.id);

      // 2. Create user profile
      const userProfile = createEmptyUserProfile(data.user.id, data.user.email || '');

      // 3. Load user's vehicle
      const vehicle = await loadUserVehicle(data.user.id);
      userProfile.vehicle = vehicle;

      setUser(userProfile);
      return true;
    } catch (error) {
      console.error('[AuthContext] Unexpected login error:', error);
      return false;
    }
  };

  const signup = async (userData: UserProfile, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Starting signup...');

      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
      });

      if (error) {
        console.error('[AuthContext] Error creating user:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('[AuthContext] User was not created');
        return false;
      }

      console.log('[AuthContext] User created:', data.user.id);

      // 2. Save user vehicle in user_vehicles if provided
      if (userData.vehicle && userData.vehicle.brand && userData.vehicle.model) {
        console.log('[AuthContext] Saving vehicle...');
        
        // Validate numeric fields before inserting
        const year = parseInt(userData.vehicle.year, 10);
        let valves: number | null = null;
        
        if (userData.vehicle.valves) {
          const parsedValves = parseInt(userData.vehicle.valves, 10);
          if (!isNaN(parsedValves)) {
            valves = parsedValves;
          } else {
            console.warn('[AuthContext] Invalid valves, saving as null:', userData.vehicle.valves);
          }
        }
        
        if (isNaN(year)) {
          console.error('[AuthContext] Invalid year:', userData.vehicle.year);
          // Continue without saving vehicle - don't fail the entire signup
          const userProfile = createEmptyUserProfile(data.user.id, userData.email);
          setUser(userProfile);
          console.log('[AuthContext] Signup complete (without vehicle)!');
          return true;
        }
        
        const { error: vehicleError } = await supabase
          .from('user_vehicles')
          .insert({
            user_id: data.user.id,
            brand: userData.vehicle.brand,
            model: userData.vehicle.model,
            year: year,
            engine: userData.vehicle.engine || null,
            valves: valves,
            fuel_type: userData.vehicle.fuel || null,
            transmission: userData.vehicle.transmission || null,
            is_primary: true,
          });

        if (vehicleError) {
          console.error('[AuthContext] Error saving vehicle:', vehicleError.message);
          // Don't fail signup, just log the error
        } else {
          console.log('[AuthContext] Vehicle saved successfully!');
        }
      }

      // 3. Auto-login after signup
      const userProfile = createEmptyUserProfile(data.user.id, userData.email);
      const vehicle = await loadUserVehicle(data.user.id);
      userProfile.vehicle = vehicle;
      
      setUser(userProfile);
      console.log('[AuthContext] Signup complete!');
      return true;
    } catch (error) {
      console.error('[AuthContext] Unexpected signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('[AuthContext] Logout complete');
    } catch (error) {
      console.error('[AuthContext] Error logging out:', error);
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

  // Load existing session on startup and subscribe to auth state changes
  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('[AuthContext] Loading session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[AuthContext] Session found:', session.user.id);
          
          // Load user data
          const userProfile = createEmptyUserProfile(session.user.id, session.user.email || '');

          // Load vehicle
          const vehicle = await loadUserVehicle(session.user.id);
          userProfile.vehicle = vehicle;

          setUser(userProfile);
        } else {
          console.log('[AuthContext] No session found');
        }
      } catch (error) {
        console.error('[AuthContext] Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = createEmptyUserProfile(session.user.id, session.user.email || '');
        const vehicle = await loadUserVehicle(session.user.id);
        userProfile.vehicle = vehicle;
        setUser(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Keep existing user data, just update if needed
        if (!user) {
          const userProfile = createEmptyUserProfile(session.user.id, session.user.email || '');
          const vehicle = await loadUserVehicle(session.user.id);
          userProfile.vehicle = vehicle;
          setUser(userProfile);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
