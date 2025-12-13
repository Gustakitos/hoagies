import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { hoagiesApi } from '../../api/endpoints';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EditHoagie'>;

export default function EditHoagieScreen({ route, navigation }: Props) {
  const { id: hoagieId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [collaborators, setCollaborators] = useState<
    { id: string; name: string }[]
  >([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const loadHoagie = React.useCallback(async () => {
    try {
      setLoading(true);
      const hoagie = await hoagiesApi.getById(hoagieId);
      setName(hoagie.name);
      setIngredients(hoagie.ingredients.length > 0 ? hoagie.ingredients : ['']);
      setCollaborators(hoagie.collaborators || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load hoagie');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [hoagieId, navigation]);

  useEffect(() => {
    loadHoagie();
  }, [loadHoagie]);

  const handleUpdateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      const updatedHoagie = await hoagiesApi.addCollaborator(
        hoagieId,
        inviteEmail.trim()
      );
      setCollaborators(updatedHoagie.collaborators || []);
      setInviteEmail('');
      Alert.alert('Success', 'Collaborator added successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add collaborator'
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await hoagiesApi.removeCollaborator(hoagieId, userId);
      setCollaborators(collaborators.filter((c) => c.id !== userId));
      Alert.alert('Success', 'Collaborator removed successfully');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to remove collaborator'
      );
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a hoagie name');
      return;
    }

    const filteredIngredients = ingredients.filter((i) => i.trim());
    if (filteredIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    try {
      setSubmitting(true);
      await hoagiesApi.update(hoagieId, {
        name: name.trim(),
        ingredients: filteredIngredients,
      });
      Alert.alert('Success', 'Hoagie updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update hoagie'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hoagie Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Best Hoagie EVER"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredients *</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItemContainer}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor={colors.textSecondary}
                  value={ingredient}
                  onChangeText={(value) => handleUpdateIngredient(index, value)}
                  maxLength={100}
                />
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveIngredient(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddIngredient}
            >
              <Text style={styles.addButtonText}>+ Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Collaborators</Text>
            {collaborators.map((collaborator) => (
              <View key={collaborator.id} style={styles.listItemContainer}>
                <Text
                  style={[styles.input, styles.listInput, styles.readOnlyInput]}
                >
                  {collaborator.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveCollaborator(collaborator.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.listItemContainer}>
              <TextInput
                style={[styles.input, styles.listInput]}
                placeholder="Enter email to invite"
                placeholderTextColor={colors.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.addButton, styles.inviteButton]}
                onPress={handleInvite}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.addButtonText}>Invite</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Hoagie</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    addButton: {
      alignItems: 'center',
      backgroundColor: '#4A90E2', // Keep consistent or add to colors constant? Let's use as is for now, or add 'secondary'/'info' color.
      borderRadius: 8,
      padding: 12,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    form: {
      padding: 20,
    },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      padding: 12,
    },
    inputGroup: {
      marginBottom: 24,
    },
    inviteButton: {
      justifyContent: 'center',
      width: 80,
    },
    label: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    listInput: {
      flex: 1,
    },
    listItemContainer: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    readOnlyInput: {
      backgroundColor: colors.background,
      color: colors.textSecondary,
      paddingVertical: 12,
    },
    removeButton: {
      alignItems: 'center',
      backgroundColor: colors.error,
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      marginTop: 6,
      width: 36,
    },
    removeButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    submitButton: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 8,
      marginTop: 10,
      padding: 16,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
