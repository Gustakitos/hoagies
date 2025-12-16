import React from 'react';
import { Platform } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import {
  RootStackParamList,
  BottomTabParamList,
} from './types/navigation.types';
import { Home, PlusSquare, User } from 'lucide-react-native';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HoagieListScreen from './screens/hoagies/HoagieListScreen';
import HoagieDetailScreen from './screens/hoagies/HoagieDetailScreen';
import CreateHoagieScreen from './screens/hoagies/CreateHoagieScreen';
import EditHoagieScreen from './screens/hoagies/EditHoagieScreen';
import AddCollaboratorScreen from './screens/hoagies/AddCollaboratorScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.tint,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HoagieListScreen}
        options={{
          title: 'Hoagie Hub',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateHoagieScreen}
        options={{
          title: 'Create Hoagie',
          tabBarIcon: ({ color, size }) => (
            <PlusSquare color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

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
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HoagieDetail"
              component={HoagieDetailScreen}
              options={{ title: 'Hoagie Details', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="EditHoagie"
              component={EditHoagieScreen}
              options={{ title: 'Edit Hoagie', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="AddCollaborator"
              component={AddCollaboratorScreen}
              options={{
                title: 'Manage Collaborators',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const isAndroid15 = Platform.OS === 'android' && Platform.Version >= 35;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <AuthProvider>
              <SafeAreaProvider
                style={
                  isAndroid15
                    ? { marginBottom: initialWindowMetrics?.insets.bottom }
                    : {}
                }
              >
                <Navigation />
              </SafeAreaProvider>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
