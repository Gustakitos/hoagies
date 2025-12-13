import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { HoagieListScreenProps } from '../../types/navigation.types';
import { Hoagie } from '../../types/hoagie.types';
import { hoagiesApi } from '../../api/endpoints';
import HoagieCard from '../../components/HoagieCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function HoagieListScreen({
  navigation,
}: HoagieListScreenProps) {
  const { logout, user } = useAuth();
  const { colors, toggleTheme, theme } = useTheme();
  const [hoagies, setHoagies] = useState<Hoagie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, theme, colors]);

  useEffect(() => {
    fetchHoagies(1);
  }, []);

  const fetchHoagies = async (pageNum: number, append: boolean = false) => {
    try {
      const response = await hoagiesApi.getAll(pageNum, 10);

      if (append) {
        setHoagies((prev) => [...prev, ...response.data]);
      } else {
        setHoagies(response.data);
      }

      setTotal(response.meta.total);
      setHasMore(response.meta.hasNextPage);
      setPage(pageNum);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load hoagies';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHoagies(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchHoagies(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Text style={styles.loadingMore}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🥖</Text>
        <Text style={styles.emptyText}>No hoagies yet</Text>
        <Text style={styles.emptySubtext}>Be the first to create one!</Text>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading hoagies..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
          <Text style={styles.totalCount}>{total} hoagies available</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateHoagie')}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={hoagies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HoagieCard
            hoagie={item}
            onPress={() => navigation.navigate('HoagieDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    createButton: {
      backgroundColor: colors.tint,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptySubtext: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    footerLoader: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    greeting: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    header: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      marginLeft: 16,
      padding: 4,
    },
    headerButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    listContent: {
      flexGrow: 1,
      paddingVertical: 8,
    },
    loadingMore: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    totalCount: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
  });
