import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation.types';
import { Hoagie, Comment } from '../../types/hoagie.types';
import { hoagiesApi, commentsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/CommentItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/colors';
import { getErrorMessage } from '../../utils/errors';
import { toast } from 'sonner-native';

type Props = NativeStackScreenProps<RootStackParamList, 'HoagieDetail'>;

export default function HoagieDetailScreen({ route, navigation }: Props) {
  const hoagieId = route.params.id;
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [hoagie, setHoagie] = useState<Hoagie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const loadHoagieDetails = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const [hoagieData, commentsData] = await Promise.all([
          hoagiesApi.getById(hoagieId),
          commentsApi.getByHoagieId(hoagieId, 1, 10),
        ]);
        setHoagie(hoagieData);
        setComments(commentsData.data);
        setHasMoreComments(commentsData.meta.hasNextPage);
        setCommentsPage(1);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        toast.error(
          typeof message === 'string'
            ? message
            : 'Failed to load hoagie details'
        );
        navigation.goBack();
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [hoagieId, navigation]
  );

  useFocusEffect(
    useCallback(() => {
      loadHoagieDetails();
    }, [loadHoagieDetails])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadHoagieDetails(false),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    setRefreshing(false);
  };

  const loadMoreComments = async () => {
    if (!hasMoreComments || loadingMoreComments) return;

    try {
      setLoadingMoreComments(true);
      const nextPage = commentsPage + 1;
      const commentsData = await commentsApi.getByHoagieId(
        hoagieId,
        nextPage,
        10
      );
      setComments([...comments, ...commentsData.data]);
      setHasMoreComments(commentsData.meta.hasNextPage);
      setCommentsPage(nextPage);
    } catch (error: unknown) {
      toast.error('Failed to load more comments');
      console.log(error);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const data = { text: commentText.trim() };
      const newComment = await commentsApi.create(hoagieId, data);
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(
        typeof message === 'string' ? message : 'Failed to post comment'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteHoagie = async () => {
    try {
      await hoagiesApi.delete(hoagieId);
      toast.success('Hoagie deleted successfully');
      navigation.goBack();
    } catch (error: unknown) {
      console.log(error);
      toast.error('Failed to delete hoagie');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!hoagie) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Hoagie not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === hoagie.creator.id;
  const isCollaborator = hoagie.collaborators?.some((c) => c.id === user?.id);
  const canEdit = isOwner || isCollaborator;

  return (
    <View style={styles.container}>
      <ScrollView
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
            progressBackgroundColor={colors.card}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isCloseToBottom) {
            loadMoreComments();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.hoagieCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{hoagie.name}</Text>
            {canEdit && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('EditHoagie', { id: hoagieId })
                  }
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                {isOwner && (
                  <>
                    <TouchableOpacity
                      style={styles.collabButton}
                      onPress={() =>
                        navigation.navigate('AddCollaborator', { hoagieId })
                      }
                    >
                      <Text style={styles.collabButtonText}>+ User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteHoagie}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {hoagie.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.listItem}>
                • {ingredient}
              </Text>
            ))}
          </View>

          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Created by: {hoagie.creator.name}
            </Text>
            <Text style={styles.metadataText}>
              {new Date(hoagie.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {hoagie.collaborators && hoagie.collaborators.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collaborators:</Text>
              {hoagie.collaborators.map((collaborator) => (
                <Text key={collaborator.id} style={styles.listItem}>
                  • {collaborator.name}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                submittingComment && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} currentUserId={user?.id} />
            </React.Fragment>
          ))}

          {loadingMoreComments && (
            <ActivityIndicator style={styles.loadingMore} color={colors.tint} />
          )}

          {!hasMoreComments && comments.length > 0 && (
            <Text style={styles.endText}>No more comments</Text>
          )}

          {comments.length === 0 && (
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    addCommentContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    commentInput: {
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      flex: 1,
      fontSize: 15,
      minHeight: 60,
      padding: 12,
      textAlignVertical: 'top',
    },
    commentsSection: {
      backgroundColor: colors.card,
      padding: 20,
    },
    commentsTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    collabButton: {
      backgroundColor: '#34C759',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    collabButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: colors.error,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 16,
    },
    editButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    endText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginVertical: 20,
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      marginTop: 50,
      textAlign: 'center',
    },
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    hoagieCard: {
      backgroundColor: colors.card,
      marginBottom: 10,
      padding: 20,
    },
    listItem: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 20,
      marginBottom: 6,
    },
    loadingMore: {
      marginVertical: 20,
    },
    metadata: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 12,
    },
    metadataText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    noCommentsText: {
      color: colors.textSecondary,
      fontSize: 15,
      marginVertical: 30,
      textAlign: 'center',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    submitButton: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 8,
      justifyContent: 'center',
      minWidth: 70,
      paddingHorizontal: 20,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    title: {
      color: colors.text,
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
    },
  });
