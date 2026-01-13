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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userError) {
          console.error('Erro ao buscar usuário:', userError);
        }

        if (userData?.role === 'store_owner') {
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', session.user.id)
            .maybeSingle();

          if (storeError) {
            console.error('Erro ao buscar loja:', storeError);
          }

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
      // 1. Autenticar no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro de autenticação:', error);
        return false;
      }

      if (!data.user) {
        console.error('Usuário não encontrado');
        return false;
      }

      // 2. Buscar role (usar maybeSingle)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
      }

      // 3. Se não encontrou o usuário, criar agora
      if (!userData) {
        console.log('Usuário não existe na tabela users, criando...');
        
        // Garantir que temos email válido
        if (!data.user.email) {
          console.error('Email do usuário não está disponível');
          await supabase.auth.signOut();
          return false;
        }
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'store_owner',
            name: data.user.user_metadata?.owner_name || data.user.email || 'Lojista',
          });

        if (createUserError) {
          console.error('Erro ao criar usuário na tabela:', createUserError);
          await supabase.auth.signOut();
          return false;
        }
      } else if (userData.role !== 'store_owner') {
        console.error('Usuário não é lojista');
        await supabase.auth.signOut();
        return false;
      }

      // 4. Buscar loja (usar maybeSingle)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', data.user.id)
        .maybeSingle();

      if (storeError) {
        console.error('Erro ao buscar loja:', storeError);
        await supabase.auth.signOut();
        return false;
      }

      if (!storeData) {
        console.error('Loja não encontrada para este usuário');
        await supabase.auth.signOut();
        return false;
      }

      setStore(storeData);
      return true;

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
