import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Hoagie } from '../types/hoagie.types';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../constants/colors';

export interface HoagieCardProps {
  hoagie: Hoagie;
  onPress: () => void;
}

export default function HoagieCard({ hoagie, onPress }: HoagieCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={
          hoagie.pictureUrl
            ? { uri: hoagie.pictureUrl }
            : require('../../assets/hoagie-placeholder.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    commentCount: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    content: {
      padding: 16,
    },
    creator: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    date: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    image: {
      backgroundColor: colors.background,
      height: 240,
      width: '100%',
    },
    ingredients: {
      display: 'none',
    },
    name: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 2,
    },
  });
