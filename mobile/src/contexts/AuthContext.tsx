import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  signup: (userData: UserProfile) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: UserProfile) => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - futuramente conectar com Supabase
    if (email && password.length >= 6) {
      // Simular usuário mockado
      setUser({
        name: 'João Lucas',
        email: email,
        cpfCnpj: '123.456.789-00',
        phone: '(11) 98765-4321',
        address: {
          cep: '01310-100',
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 101',
          city: 'São Paulo',
          state: 'SP',
        },
        vehicle: {
          type: 'carros',
          brand: 'Chevrolet',
          model: 'Onix',
          year: '2020',
          engine: '1.0',
          valves: '12v',
          fuel: 'Flex',
          transmission: 'Manual',
        },
      });
      return true;
    }
    return false;
  };

  const signup = async (userData: UserProfile): Promise<boolean> => {
    // Mock signup - futuramente conectar com Supabase
    setUser(userData);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (userData: UserProfile) => {
    setUser(userData);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<boolean> => {
    if (user) {
      setUser({ ...user, ...userData });
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
