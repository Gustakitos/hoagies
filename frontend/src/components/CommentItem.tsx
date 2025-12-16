import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Comment } from '../types/hoagie.types';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../constants/colors';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | undefined;
}

export default function CommentItem({
  comment,
  currentUserId,
}: CommentItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{comment.user.name}</Text>
        <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
      </View>
      <Text style={styles.text}>{comment.text}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
      padding: 12,
    },
    date: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    text: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    userName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });
