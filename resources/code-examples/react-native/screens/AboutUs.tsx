import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosRequest from '../helper/axiosRequest';
import { API } from '../helper/config';
import { Button } from '../components/Button';
import HTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AboutUs = () => {
  const [aboutUsContent, setAboutUsContent] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  useEffect(() => {
    getAboutUs();
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.user_id);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  const getAboutUs = async () => {
    setIsLoading(true);
    try {
      const response = await axiosRequest.post(
        `${API.ENDPOINTS.MOBILEAPI}/${API.ENDPOINTS.GET_ABOUTUS}`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      setAboutUsContent(response.aboutus_content);
    } catch (error: any) {
      console.error('Error getting about us content:', error);
      Alert.alert('Error', 'Failed to load about us content');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: deleteAccount,
          style: 'destructive'
        }
      ]
    );
  };

  const deleteAccount = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosRequest.post(
        `${API.ENDPOINTS.MOBILEAPI}/${API.ENDPOINTS.DELETE_USER}`,
        { user_id: userId },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 'success') {
        Alert.alert(
          'Account Deleted',
          'Thank you for using our app.',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await AsyncStorage.clear();
                } catch (err) {
                  console.warn('Error clearing storage:', err);
                  // Continue even if clearing fails
                } finally {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      try {
        await AsyncStorage.clear();
      } catch (err) {
        console.warn('Error clearing storage:', err);
        // Continue even if clearing fails
      } finally {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {aboutUsContent ? (
          <HTML 
            source={{ html: aboutUsContent }} 
            contentWidth={width}
            tagsStyles={{
              p: styles.paragraph,
              h1: styles.heading,
              h2: styles.heading,
              h3: styles.heading,
              a: styles.link
            }}
          />
        ) : (
          <Text style={styles.noContent}>No content available</Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button 
          title="Delete Account" 
          onPress={confirmDeleteAccount}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: 8
  },
  link: {
    color: '#007AFF'
  },
  noContent: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  deleteButton: {
    backgroundColor: '#FF3B30'
  },
  deleteButtonText: {
    color: '#fff'
  }
});
