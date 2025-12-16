import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { RegisterScreenProps } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/colors';
import { getErrorMessage } from '../../utils/errors';
import { toast } from 'sonner-native';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return 'Please fill in all fields';
    }

    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(Array.isArray(message) ? message.join('\n') : message);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Hoagie Hub today!</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />

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
              autoComplete="password-new"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
              editable={!isLoading}
            />

            <Text style={styles.hint}>
              Password must be at least 8 characters and contain uppercase,
              lowercase, and number
            </Text>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
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
    hint: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 16,
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
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    loginLink: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    logo: {
      fontSize: 80,
      marginBottom: 16,
      textAlign: 'center',
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
