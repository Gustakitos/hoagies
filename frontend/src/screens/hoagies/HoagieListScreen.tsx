import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { HoagieListScreenProps } from '../../types/navigation.types';
import { Hoagie } from '../../types/hoagie.types';
import { hoagiesApi } from '../../api/endpoints';
import HoagieCard from '../../components/HoagieCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../utils/errors';
import { Search as SearchIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';

export default function HoagieListScreen({
  navigation,
}: HoagieListScreenProps) {
  const { colors } = useTheme();
  const [hoagies, setHoagies] = useState<Hoagie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(() => createStyles(colors), [colors]);

  const fetchHoagies = useCallback(
    async (pageNum: number, append: boolean = false) => {
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
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        toast.error(
          typeof message === 'string' ? message : 'Failed to load hoagies'
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchHoagies(1);
    }, [fetchHoagies])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchHoagies(1),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    setIsRefreshing(false);
  }, [fetchHoagies]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchHoagies(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, fetchHoagies]);

  const filteredHoagies = useMemo(() => {
    if (!searchQuery) return hoagies;
    const lowerQuery = searchQuery.toLowerCase();
    return hoagies.filter((h) => h.name.toLowerCase().includes(lowerQuery));
  }, [hoagies, searchQuery]);

  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        {isLoadingMore && (
          <View style={styles.footerLoader}>
            <Text style={styles.loadingMore}>Loading more...</Text>
          </View>
        )}
        <Text style={styles.totalCount}>
          Showing {filteredHoagies.length} of {total} hoagies
        </Text>
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
        <View style={styles.searchContainer}>
          <SearchIcon
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hoagies"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        alwaysBounceVertical={true}
        data={filteredHoagies}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={LinearTransition.springify()}
          >
            <HoagieCard
              hoagie={item}
              onPress={() =>
                navigation.navigate('HoagieDetail', { id: item.id })
              }
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
            progressBackgroundColor={colors.card}
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 0,
      paddingHorizontal: 12,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 16,
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
    footerContainer: {
      paddingBottom: 40,
      paddingTop: 10,
      alignItems: 'center',
    },
    footerLoader: {
      alignItems: 'center',
      paddingVertical: 10,
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
