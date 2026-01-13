import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Profile: undefined;
  EditProfile: undefined;
  EditVehicle: undefined;
  PasswordReset: { token: string };
  Checkout: undefined;
  OrderSuccess: undefined;
  Product: { productId: string };
  Cart: undefined;
  Search: undefined;
};

// Main Tab Navigator types
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Orders: undefined;
};

// Helper types for navigation props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
