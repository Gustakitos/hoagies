import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { RootStackParamList } from './types/navigation.types';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HoagieListScreen from './screens/hoagies/HoagieListScreen';
import HoagieDetailScreen from './screens/hoagies/HoagieDetailScreen';
import CreateHoagieScreen from './screens/hoagies/CreateHoagieScreen';
import EditHoagieScreen from './screens/hoagies/EditHoagieScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { user, isLoading } = useAuth();
  const { theme, colors } = useTheme();

  if (isLoading) {
    return null;
  }

  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.tint,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="HoagieList"
              component={HoagieListScreen}
              options={{ title: 'Hoagie Hub' }}
            />
            <Stack.Screen
              name="HoagieDetail"
              component={HoagieDetailScreen}
              options={{ title: 'Hoagie Details' }}
            />
            <Stack.Screen
              name="CreateHoagie"
              component={CreateHoagieScreen}
              options={{ title: 'Create Hoagie' }}
            />
            <Stack.Screen
              name="EditHoagie"
              component={EditHoagieScreen}
              options={{ title: 'Edit Hoagie' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
