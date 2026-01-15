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

// Transmission mapping helpers
const mapTransmissionToDbEnum = (uiLabel: string): string => {
  const mapping: { [key: string]: string } = {
    'Manual': 'manual',
    'Automático': 'automatic',
    'CVT': 'cvt',
    'Automatizado': 'automated_manual',
  };
  const result = mapping[uiLabel];
  if (!result) {
    console.warn('[AuthContext] Unknown transmission UI label:', uiLabel, '- defaulting to unknown');
  }
  return result || 'unknown';
};

const mapTransmissionFromDbEnum = (dbValue: string | null): string => {
  if (!dbValue) return '';
  
  const mapping: { [key: string]: string } = {
    'manual': 'Manual',
    'automatic': 'Automático',
    'cvt': 'CVT',
    'automated_manual': 'Automatizado',
    'unknown': '',
  };
  const result = mapping[dbValue];
  if (result === undefined) {
    console.warn('[AuthContext] Unexpected transmission DB value:', dbValue);
    return dbValue; // Return as-is if not recognized
  }
  return result;
};

// Helper to parse valves from string like "12v" to number 12
const parseValvesString = (valvesStr: string): number | null => {
  if (!valvesStr) return null;
  const parsed = parseInt(valvesStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(parsed) ? null : parsed;
};

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
    valves: vehicleData.valves ? `${vehicleData.valves}v` : '',
    fuel: vehicleData.fuel_type || '',
    transmission: mapTransmissionFromDbEnum(vehicleData.transmission),
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

      // 2. Load user profile from user_metadata
      const metadata = data.user.user_metadata || {};
      const userProfile: UserProfile = {
        id: data.user.id,
        name: metadata.name || data.user.email?.split('@')[0] || 'Usuário',
        email: data.user.email || '',
        cpfCnpj: metadata.cpfCnpj || '',
        phone: metadata.phone || '',
        address: {
          cep: metadata.address?.cep || '',
          street: metadata.address?.street || '',
          number: metadata.address?.number || '',
          complement: metadata.address?.complement || '',
          city: metadata.address?.city || '',
          state: metadata.address?.state || '',
        },
        vehicle: null,
      };

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

      // 1. Create user in Supabase Auth with user_metadata
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
        options: {
          data: {
            name: userData.name,
            cpfCnpj: userData.cpfCnpj,
            phone: userData.phone,
            address: {
              cep: userData.address.cep,
              street: userData.address.street,
              number: userData.address.number,
              complement: userData.address.complement,
              city: userData.address.city,
              state: userData.address.state,
            },
          },
        },
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
        const valves = parseValvesString(userData.vehicle.valves);
        
        if (isNaN(year)) {
          console.error('[AuthContext] Invalid year:', userData.vehicle.year);
          // Continue without saving vehicle - don't fail the entire signup
          const userProfile = { ...userData, id: data.user.id };
          userProfile.vehicle = null;
          setUser(userProfile);
          console.log('[AuthContext] Signup complete (without vehicle)!');
          return true;
        }
        
        // Map transmission from UI label to DB enum
        const transmissionEnum = mapTransmissionToDbEnum(userData.vehicle.transmission);
        
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
            transmission: transmissionEnum,
            is_primary: true,
          });

        if (vehicleError) {
          console.error('[AuthContext] Error saving vehicle:', vehicleError.message);
          // Don't fail signup, just log the error
        } else {
          console.log('[AuthContext] Vehicle saved successfully!');
        }
      }

      // 3. Auto-login after signup - create full user profile from signup data
      const userProfile = { ...userData, id: data.user.id };
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
    
    try {
      // If vehicle is being updated, persist to database
      if (userData.vehicle) {
        console.log('[AuthContext] Updating vehicle in database...');
        
        const year = parseInt(userData.vehicle.year, 10);
        const valves = parseValvesString(userData.vehicle.valves);
        
        if (isNaN(year)) {
          console.error('[AuthContext] Invalid year:', userData.vehicle.year);
          return false;
        }
        
        // Map transmission from UI label to DB enum
        const transmissionEnum = mapTransmissionToDbEnum(userData.vehicle.transmission);
        
        // First, check if user already has a primary vehicle
        const { data: existingVehicle, error: fetchError } = await supabase
          .from('user_vehicles')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('[AuthContext] Error fetching existing vehicle:', fetchError.message);
          return false;
        }
        
        const vehicleData = {
          user_id: user.id,
          brand: userData.vehicle.brand,
          model: userData.vehicle.model,
          year: year,
          engine: userData.vehicle.engine || null,
          valves: valves,
          fuel_type: userData.vehicle.fuel || null,
          transmission: transmissionEnum,
          is_primary: true,
        };
        
        if (existingVehicle) {
          // Update existing vehicle
          const { error: updateError } = await supabase
            .from('user_vehicles')
            .update(vehicleData)
            .eq('id', existingVehicle.id);
          
          if (updateError) {
            console.error('[AuthContext] Error updating vehicle:', updateError.message);
            return false;
          }
          console.log('[AuthContext] Vehicle updated successfully');
        } else {
          // Insert new vehicle
          const { error: insertError } = await supabase
            .from('user_vehicles')
            .insert(vehicleData);
          
          if (insertError) {
            console.error('[AuthContext] Error inserting vehicle:', insertError.message);
            return false;
          }
          console.log('[AuthContext] Vehicle inserted successfully');
        }
        
        // Reload vehicle from database to ensure state is in sync
        const vehicle = await loadUserVehicle(user.id);
        const updatedUser = { ...user, vehicle };
        setUser(updatedUser);
        
        return true;
      }
      
      // For non-vehicle updates, just update local state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('[AuthContext] Unexpected error in updateUser:', error);
      return false;
    }
  };

  // Load existing session on startup and subscribe to auth state changes
  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('[AuthContext] Loading session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[AuthContext] Session found:', session.user.id);
          
          // Load user data from user_metadata
          const metadata = session.user.user_metadata || {};
          const userProfile: UserProfile = {
            id: session.user.id,
            name: metadata.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            cpfCnpj: metadata.cpfCnpj || '',
            phone: metadata.phone || '',
            address: {
              cep: metadata.address?.cep || '',
              street: metadata.address?.street || '',
              number: metadata.address?.number || '',
              complement: metadata.address?.complement || '',
              city: metadata.address?.city || '',
              state: metadata.address?.state || '',
            },
            vehicle: null,
          };

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
        const metadata = session.user.user_metadata || {};
        const userProfile: UserProfile = {
          id: session.user.id,
          name: metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          cpfCnpj: metadata.cpfCnpj || '',
          phone: metadata.phone || '',
          address: {
            cep: metadata.address?.cep || '',
            street: metadata.address?.street || '',
            number: metadata.address?.number || '',
            complement: metadata.address?.complement || '',
            city: metadata.address?.city || '',
            state: metadata.address?.state || '',
          },
          vehicle: null,
        };
        const vehicle = await loadUserVehicle(session.user.id);
        userProfile.vehicle = vehicle;
        setUser(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Keep existing user data, just update if needed
        if (!user) {
          const metadata = session.user.user_metadata || {};
          const userProfile: UserProfile = {
            id: session.user.id,
            name: metadata.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            cpfCnpj: metadata.cpfCnpj || '',
            phone: metadata.phone || '',
            address: {
              cep: metadata.address?.cep || '',
              street: metadata.address?.street || '',
              number: metadata.address?.number || '',
              complement: metadata.address?.complement || '',
              city: metadata.address?.city || '',
              state: metadata.address?.state || '',
            },
            vehicle: null,
          };
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
