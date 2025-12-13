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
import { CreateHoagieScreenProps } from '../../types/navigation.types';
import { hoagiesApi } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

export default function CreateHoagieScreen({
  navigation,
}: CreateHoagieScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Please enter a hoagie name';
    }

    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }

    if (!ingredientsText.trim()) {
      return 'Please enter at least one ingredient';
    }

    const ingredients = ingredientsText
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (ingredients.length === 0) {
      return 'Please enter at least one ingredient';
    }

    if (ingredients.length > 20) {
      return 'Maximum 20 ingredients allowed';
    }

    if (pictureUrl.trim() && !isValidUrl(pictureUrl.trim())) {
      return 'Please enter a valid image URL';
    }

    return null;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreate = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    const ingredients = ingredientsText
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    setIsLoading(true);
    try {
      await hoagiesApi.create({
        name: name.trim(),
        ingredients,
        pictureUrl: pictureUrl.trim() || undefined,
      });

      Alert.alert('Success', 'Hoagie created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to create hoagie';
      Alert.alert(
        'Error',
        Array.isArray(message) ? message.join('\n') : message
      );
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
          <Text style={styles.label}>Hoagie Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Classic"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={100}
            editable={!isLoading}
          />

          <Text style={styles.label}>Ingredients * (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Italian bread&#10;Salami&#10;Ham&#10;Provolone&#10;Lettuce&#10;Tomato"
            placeholderTextColor={colors.textSecondary}
            value={ingredientsText}
            onChangeText={setIngredientsText}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            editable={!isLoading}
          />

          <Text style={styles.label}>Picture URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.textSecondary}
            value={pictureUrl}
            onChangeText={setPictureUrl}
            autoCapitalize="none"
            keyboardType="url"
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Hoagie'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
      marginTop: 24,
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
    cancelButton: {
      alignItems: 'center',
      borderRadius: 12,
      marginTop: 12,
      padding: 16,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    container: {
      backgroundColor: colors.card,
      flex: 1,
    },
    content: {
      padding: 24,
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      padding: 16,
    },
    label: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    scrollContent: {
      flexGrow: 1,
    },
    textArea: {
      minHeight: 160,
    },
  });
