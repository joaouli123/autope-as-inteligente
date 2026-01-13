import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Store } from '../types/lojista';

interface LojistaAuthContextData {
  store: Store | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const LojistaAuthContext = createContext<LojistaAuthContextData>({} as LojistaAuthContextData);

export const useLojistaAuth = () => useContext(LojistaAuthContext);

export function LojistaAuthProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Verificar se é lojista e buscar dados da loja
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userData?.role === 'store_owner') {
          const { data: storeData } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', session.user.id)
            .single();

          if (storeData) {
            setStore(storeData);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se é lojista
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userData?.role !== 'store_owner') {
          await supabase.auth.signOut();
          return false;
        }

        // Buscar dados da loja
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', data.user.id)
          .single();

        if (storeData) {
          setStore(storeData);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setStore(null);
  };

  return (
    <LojistaAuthContext.Provider
      value={{
        store,
        loading,
        login,
        logout,
        isAuthenticated: !!store,
      }}
    >
      {children}
    </LojistaAuthContext.Provider>
  );
}
