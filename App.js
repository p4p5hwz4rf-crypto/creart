import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { COLORS } from './src/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();
  const [isRegister, setIsRegister] = React.useState(false);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Auth">
            {() =>
              isRegister ? (
                <RegisterScreen onSwitch={() => setIsRegister(false)} />
              ) : (
                <LoginScreen onSwitch={() => setIsRegister(true)} />
              )
            }
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Main" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor={COLORS.background} />
            <RootNavigator />
          </NavigationContainer>
        </SubscriptionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
