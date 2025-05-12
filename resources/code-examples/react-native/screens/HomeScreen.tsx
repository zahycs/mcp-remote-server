/**
 * HomeScreen Component
 * 
 * Main screen of the application displaying featured content,
 * recent activities, and navigation options.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ImageSourcePropType
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import components
import Button from '../components/Button';
import Card from '../components/Card';
import FeatureCarousel from '../components/FeatureCarousel';
import LoadingIndicator from '../components/LoadingIndicator';

// Import services and utilities
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/dateUtils';
import theme from '../theme/theme';

// Define interfaces for data types
interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface User {
  firstName: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth() as { user: User | null };
  
  // State management
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchHomeData();
  }, []);

  // Function to fetch all necessary data
  const fetchHomeData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured items
      const featuredData = await ApiService.get('/featured', {}, {
        withCache: true,
        cacheTTL: 10 * 60 * 1000 // 10 minutes
      });
      
      // Fetch recent activity
      const activitiesData = await ApiService.get('/activities/recent');
      
      // Fetch personalized recommendations if user is logged in
      let recommendationsData = { items: [] };
      if (user) {
        recommendationsData = await ApiService.get('/recommendations');
      }
      
      // Update state with fetched data
      setFeaturedItems(featuredData.items || []);
      setRecentActivities(activitiesData.activities || []);
      setRecommendations(recommendationsData.items || []);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Unable to load content. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = (): void => {
    setRefreshing(true);
    fetchHomeData();
  };

  // Navigate to item details
  const handleItemPress = (item: FeaturedItem | Recommendation): void => {
    navigation.navigate('ItemDetails' as never, { itemId: item.id } as never);
  };

  // Render activity item
  const renderActivityItem = ({ item }: { item: Activity }): React.ReactElement => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => navigation.navigate('ActivityDetails' as never, { activityId: item.id } as never)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.activityImage}
      />
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activityMeta}>
          {formatDate(item.date)} • {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render recommendation item
  const renderRecommendationItem = ({ item }: { item: Recommendation }): React.ReactElement => (
    <Card 
      style={styles.recommendationCard}
      onPress={() => handleItemPress(item)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.recommendationImage}
      />
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.recommendationDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </Card>
  );

  // Loading state
  if (loading && !refreshing) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {user ? `Welcome back, ${user.firstName}!` : 'Welcome to AppName'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Discover what's new today
          </Text>
        </View>
        
        {/* Featured carousel */}
        {featuredItems.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FeatureCarousel
              items={featuredItems}
              onItemPress={handleItemPress}
            />
          </View>
        ) : null}
        
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Image 
              source={require('../assets/icons/search.png') as ImageSourcePropType} 
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Categories' as never)}
          >
            <Image 
              source={require('../assets/icons/categories.png') as ImageSourcePropType} 
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Categories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Favorites' as never)}
          >
            <Image 
              source={require('../assets/icons/favorite.png') as ImageSourcePropType} 
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Image 
              source={require('../assets/icons/notification.png') as ImageSourcePropType} 
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Updates</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent activity section */}
        {recentActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllActivities' as never)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recentActivities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activitiesList}
            />
          </View>
        )}
        
        {/* Recommendations section (only for logged in users) */}
        {user && recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Recommendations' as never)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsList}
            />
          </View>
        )}
        
        {/* Call to action */}
        <View style={styles.ctaContainer}>
          <Image 
            source={require('../assets/images/cta-background.png') as ImageSourcePropType} 
            style={styles.ctaBackground}
          />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Ready to get started?</Text>
            <Text style={styles.ctaDescription}>
              Join thousands of users and start exploring now.
            </Text>
            <Button
              title={user ? "Explore Premium" : "Sign Up Now"}
              onPress={() => navigation.navigate(user ? 'Subscription' as never : 'Signup' as never)}
              style={styles.ctaButton}
            />
          </View>
        </View>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Try Again"
              onPress={fetchHomeData}
              style={styles.retryButton}
            />
          </View>
        )}
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: theme.spacing.lg,
  },
  welcomeTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  carouselContainer: {
    marginBottom: theme.spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
  },
  actionIcon: {
    width: 40,
    height: 40,
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  activitiesList: {
    paddingLeft: theme.spacing.lg,
  },
  activityItem: {
    width: 280,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  activityContent: {
    padding: theme.spacing.md,
  },
  activityTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.xs,
  },
  activityMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  recommendationsList: {
    paddingLeft: theme.spacing.lg,
  },
  recommendationCard: {
    width: 200,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recommendationContent: {
    padding: theme.spacing.md,
  },
  recommendationTitle: {
    ...theme.typography.h6,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  recommendationDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  ctaContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    height: 180,
  },
  ctaBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ctaContent: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    justifyContent: 'center',
  },
  ctaTitle: {
    ...theme.typography.h4,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  ctaDescription: {
    ...theme.typography.body,
    color: theme.colors.white,
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
  errorContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.sm,
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeScreen;
