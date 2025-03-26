import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { storageService } from '../../../helper/storageService';
import { styles } from './PostStyles';
import { colors } from '../../../theme/colors';

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_date: string;
  featured_image?: string;
}

const PostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const postId = route.params?.id;

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const categories = await storageService.get('posts');
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          const foundPost = category.posts.find(p => p.post_id.toString() === postId?.toString());
          if (foundPost) {
            setPost(foundPost);
            navigation.setOptions({
              headerTitle: foundPost.post_title,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {post.featured_image && (
        <Image
          source={{ uri: post.featured_image }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{post.post_title}</Text>
        <Text style={styles.date}>{formatDate(post.post_date)}</Text>
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: post.post_content }}
          tagsStyles={{
            body: {
              color: colors.black,
              fontSize: 16,
              lineHeight: 24,
            },
            a: {
              color: colors.primary,
              textDecorationLine: 'underline',
            },
          }}
        />
      </View>
    </ScrollView>
  );
};

export default PostScreen;
