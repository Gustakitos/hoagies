import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LoginScreenProps } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.toLowerCase().trim(), password });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.logo}>🥖</Text>
          <Text style={styles.title}>Hoagie Hub</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={isLoading}
              >
                <Text style={styles.registerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 12,
      marginTop: 8,
      padding: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    container: {
      backgroundColor: colors.card,
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    form: {
      width: '100%',
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      marginBottom: 16,
      padding: 16,
    },
    logo: {
      fontSize: 80,
      marginBottom: 16,
      textAlign: 'center',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    registerLink: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    registerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    scrollContent: {
      flexGrow: 1,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 40,
      textAlign: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
  });
