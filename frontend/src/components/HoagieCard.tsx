import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Hoagie } from '../types/hoagie.types';
import { useTheme } from '../context/ThemeContext';

interface HoagieCardProps {
  hoagie: Hoagie;
  onPress: () => void;
}

export default function HoagieCard({ hoagie, onPress }: HoagieCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {hoagie.pictureUrl && (
        <Image
          source={{ uri: hoagie.pictureUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{hoagie.name}</Text>
        <Text style={styles.creator}>by {hoagie.creator.name}</Text>
        <Text style={styles.ingredients} numberOfLines={2}>
          {hoagie.ingredients.join(', ')}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.commentCount}>
            💬 {hoagie.commentCount}{' '}
            {hoagie.commentCount === 1 ? 'comment' : 'comments'}
          </Text>
          <Text style={styles.date}>
            {new Date(hoagie.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      elevation: 3,
      marginHorizontal: 16,
      marginVertical: 8,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    commentCount: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      padding: 16,
    },
    creator: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 8,
    },
    date: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    image: {
      backgroundColor: colors.background,
      height: 200,
      width: '100%',
    },
    ingredients: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    name: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
  });
