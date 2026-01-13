import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

// Types
import { RootStackParamList } from './src/types/navigation';

// Context
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import EditVehicleScreen from './src/screens/EditVehicleScreen';
import PasswordResetScreen from './src/screens/PasswordResetScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import ProductScreen from './src/screens/ProductScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const navigationRef = React.useRef<any>(null);

  useEffect(() => {
    // Listener para deep links quando o app está aberto
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Verificar se o app foi aberto via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    const { path, queryParams } = Linking.parse(url);
    
    if (path === 'reset-password' && queryParams?.token) {
      // Navegar para tela de reset com o token
      navigationRef.current?.navigate('PasswordReset', { token: queryParams.token as string });
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1e3a8a' }
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="EditVehicle" component={EditVehicleScreen} />
            <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
