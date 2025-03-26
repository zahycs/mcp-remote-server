import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAppUpdate from '../../../hooks/useAppUpdate';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  // Get the checkForUpdates function from the useAppUpdate hook
  // Use a shorter interval for the home screen (30 minutes)
  const { checkForUpdates } = useAppUpdate(false, 30 * 60 * 1000);
  
  // Use a ref to track if we're already checking for updates
  const isCheckingRef = useRef(false);
  
  // Track if this is the first render
  const [hasCheckedOnMount, setHasCheckedOnMount] = useState(false);

  // Check for updates once when the component mounts
  useEffect(() => {
    if (!hasCheckedOnMount && !isCheckingRef.current) {
      isCheckingRef.current = true;
      
      // Run the update check silently and forced
      checkForUpdates(true, true).finally(() => {
        isCheckingRef.current = false;
        setHasCheckedOnMount(true);
      });
    }
  }, [checkForUpdates, hasCheckedOnMount]);

  // We're not using useFocusEffect anymore to prevent multiple checks
  // when the screen is repeatedly focused

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Bluestone Apps Home screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default HomeScreen;
