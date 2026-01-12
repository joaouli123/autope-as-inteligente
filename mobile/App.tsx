import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

// Importar supabase client
import { supabase } from './services/supabaseClient';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    checkConnection();
    loadEnvVars();
  }, []);

  const loadEnvVars = () => {
    try {
      // Expo constants extra (from app.json)
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      setEnvVars({
        supabaseUrl: supabaseUrl ? '✅ Configurado' : '❌ Faltando',
        supabaseKey: supabaseKey ? '✅ Configurado' : '❌ Faltando'
      });
    } catch (e) {
      console.error('Erro ao carregar env vars:', e);
    }
  };

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      
      // Testar conexão com Supabase
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (error) {
        setError(`Erro Supabase: ${error.message}`);
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError(null);
      }
    } catch (e: any) {
      setError(`Erro de conexão: ${e.message}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.title}>AutoPeças IA</Text>
          <Text style={styles.subtitle}>Mobile App - Expo SDK 54</Text>
        </View>

        {/* Status de Conexão */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📡 Status da Conexão</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#1e3a8a" style={styles.loader} />
          ) : (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Supabase:</Text>
                <Text style={isConnected ? styles.statusSuccess : styles.statusError}>
                  {isConnected ? '✅ Conectado' : '❌ Desconectado'}
                </Text>
              </View>
              
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.button} onPress={checkConnection}>
                <Text style={styles.buttonText}>🔄 Testar Novamente</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Variáveis de Ambiente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Configuração</Text>
          {envVars && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>SUPABASE_URL:</Text>
                <Text style={styles.statusInfo}>{envVars.supabaseUrl}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>SUPABASE_ANON_KEY:</Text>
                <Text style={styles.statusInfo}>{envVars.supabaseKey}</Text>
              </View>
            </>
          )}
        </View>

        {/* Informações do Sistema */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Sistema</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Expo SDK:</Text>
            <Text style={styles.statusInfo}>54.0</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>React Native:</Text>
            <Text style={styles.statusInfo}>0.76.6</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>React:</Text>
            <Text style={styles.statusInfo}>18.3.1</Text>
          </View>
        </View>

        {/* Próximos Passos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Próximos Passos</Text>
          <Text style={styles.listItem}>✅ Configuração mobile completa</Text>
          <Text style={styles.listItem}>✅ Conexão com Supabase testada</Text>
          <Text style={styles.listItem}>⏳ Implementar tela de Login</Text>
          <Text style={styles.listItem}>⏳ Implementar tela Home</Text>
          <Text style={styles.listItem}>⏳ Adicionar navegação (tabs)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusSuccess: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  statusError: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statusInfo: {
    fontSize: 16,
    color: '#3b82f6',
  },
  loader: {
    marginVertical: 20,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
});
