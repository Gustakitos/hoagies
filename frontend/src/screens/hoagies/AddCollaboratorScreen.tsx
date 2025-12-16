import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { X, Search as SearchIcon, Users } from 'lucide-react-native';
import { hoagiesApi, usersApi } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/colors';
import { getErrorMessage } from '../../utils/errors';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/auth.types';
import { Hoagie } from '../../types/hoagie.types';
import Animated, {
  FadeIn,
  LinearTransition,
  FadeOut,
} from 'react-native-reanimated';
import { AddCollaboratorScreenProps } from '../../types/navigation.types';
import { toast } from 'sonner-native';

export default function AddCollaboratorScreen({
  navigation,
  route,
}: AddCollaboratorScreenProps) {
  const { hoagieId } = route.params;
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const styles = createStyles(colors);

  const [hoagie, setHoagie] = useState<Hoagie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

  const loadHoagie = React.useCallback(async () => {
    try {
      const data = await hoagiesApi.getById(hoagieId);
      setHoagie(data);
      const invited = new Set(data.collaborators?.map((c) => c.id) || []);
      setInvitedUsers(invited);
    } catch (error) {
      toast.error('Failed to load hoagie details');
      console.log(error);
      navigation.goBack();
    }
  }, [hoagieId, navigation]);

  useEffect(() => {
    loadHoagie();
  }, [hoagieId, loadHoagie]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const results = await usersApi.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userToInvite: User) => {
    try {
      await hoagiesApi.addCollaborator(hoagieId, userToInvite.email);
      setInvitedUsers((prev) => new Set([...prev, userToInvite.id]));
      toast.success(`Invited ${userToInvite.name}!`);
      loadHoagie();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(
        typeof message === 'string' ? message : 'Failed to invite user'
      );
    }
  };

  const renderUserItem = ({
    item,
    isSearchResult,
  }: {
    item: User | { id: string; name: string; email?: string };
    isSearchResult?: boolean;
  }) => {
    const isInvited = invitedUsers.has(item.id);
    const isCurrentUser = item.id === currentUser?.id;
    const isCreator = hoagie?.creator.id === item.id;

    return (
      <Animated.View
        key={item.id}
        style={styles.userRow}
        layout={LinearTransition.springify()}
        entering={FadeIn}
        exiting={FadeOut}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.name}</Text>
            {'email' in item && (
              <Text style={styles.userEmail}>{item.email}</Text>
            )}
          </View>
        </View>

        {isSearchResult && !isCurrentUser && !isCreator && (
          <TouchableOpacity
            style={[
              styles.inviteButton,
              isInvited && styles.inviteButtonDisabled,
            ]}
            onPress={() => !isInvited && handleInvite(item as User)}
            disabled={isInvited}
          >
            <Text
              style={[
                styles.inviteButtonText,
                isInvited && styles.inviteButtonTextDisabled,
              ]}
            >
              {isInvited ? 'Invited' : 'Invite'}
            </Text>
          </TouchableOpacity>
        )}
        {isCreator && <Text style={styles.roleText}>Owner</Text>}
        {!isSearchResult && !isCreator && (
          <Text style={styles.roleText}>Collaborator</Text>
        )}
      </Animated.View>
    );
  };

  if (!hoagie) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Collaborators</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Collaborators</Text>
          <FlatList
            data={[
              hoagie.creator,
              ...(hoagie.collaborators || []).map((c) => ({ ...c, email: '' })),
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              renderUserItem({ item, isSearchResult: false })
            }
            scrollEnabled={false}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Users</Text>
          <View style={styles.searchContainer}>
            <SearchIcon
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by email..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {searching ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={colors.tint} />
              <Text style={styles.loaderText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) =>
                renderUserItem({ item, isSearchResult: true })
              }
              ListEmptyComponent={() =>
                searchQuery ? (
                  <View style={styles.emptyState}>
                    <Users size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No users found</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 24,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      height: '100%',
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    userName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    inviteButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: colors.tint,
    },
    inviteButtonDisabled: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    inviteButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    inviteButtonTextDisabled: {
      color: colors.textSecondary,
    },
    roleText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    loaderContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loaderText: {
      marginLeft: 10,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 16,
    },
  });
