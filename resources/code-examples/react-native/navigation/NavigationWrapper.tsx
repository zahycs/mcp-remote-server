import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { NavigationMonitorService } from '../helper/NavigationMonitorService';

interface NavigationProps {
  navigation: any;
  route: {
    name: string;
  };
}

export const withNavigationWrapper = (WrappedComponent: React.ComponentType<any>) => {
  return function WithNavigationWrapper(props: NavigationProps) {
    const { navigation, route } = props;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Only check for updates if not an excluded route
      if (!NavigationMonitorService.isExcludedRoute(route.name)) {
        // Perform silent update checks without showing loading indicator
        try {
          checkForUpdates()
            .catch(err => {
              console.error('Error in checkForUpdates:', err);
              setError(`Failed to check for updates: ${err.message}`);
            });
        } catch (error) {
          console.error('Error in navigation wrapper:', error);
          setError(`Navigation error: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }, [route]);

    const checkForUpdates = async () => {
      try {
        // Check for updates with improved error handling
        const { termsNeedsUpdate, privacyNeedsUpdate } = await NavigationMonitorService.checkForUpdates();
        
        // Only show alert if updates are actually needed
        if (termsNeedsUpdate || privacyNeedsUpdate) {
          Alert.alert(
            'Update Required',
            `Please review and accept the ${termsNeedsUpdate ? 'Terms' : 'Privacy Policy'} updates to continue.`,
            [
              {
                text: 'Review',
                onPress: () => {
                  navigation.navigate(
                    termsNeedsUpdate ? 'TermsAndConditions' : 'PrivacyPolicy',
                    { fromUpdate: true }
                  );
                },
              },
            ],
            { cancelable: false }
          );
        }
        
        return { termsNeedsUpdate, privacyNeedsUpdate };
      } catch (error) {
        console.error('Failed to check for terms/privacy updates:', error);
        // Don't throw here, just log the error and continue
        return { termsNeedsUpdate: false, privacyNeedsUpdate: false };
      }
    };

    // If there's an error, show it but still render the component
    if (error) {
      console.warn('NavigationWrapper encountered an error:', error);
      // We could show an error UI here, but for now we'll just log it and continue
    }

    // Render the wrapped component without any loading overlay
    return (
      <View style={styles.container}>
        <WrappedComponent {...props} />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withNavigationWrapper;
