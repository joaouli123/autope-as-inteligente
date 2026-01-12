import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 AutoPeças IA</Text>
      <Text style={styles.subtitle}>App Mobile - Expo</Text>
      <Text style={styles.text}>
        ✅ Estrutura inicial configurada!{'\n'}
        📱 Pronto para desenvolvimento
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
});
