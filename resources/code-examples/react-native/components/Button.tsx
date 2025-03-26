import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';

/**
 * Button component props interface
 */
interface ButtonProps {
  /**
   * Button text content
   */
  title: string;
  
  /**
   * Function to call when button is pressed
   */
  onPress: () => void;
  
  /**
   * Optional custom styles for the button container
   */
  style?: ViewStyle;
  
  /**
   * Optional custom styles for the button text
   */
  textStyle?: TextStyle;
  
  /**
   * Whether to show a loading indicator instead of text
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Test ID for testing
   * @default 'button'
   */
  testID?: string;
}

/**
 * Reusable button component with loading state support
 * 
 * @example
 * ```tsx
 * <Button 
 *   title="Login" 
 *   onPress={handleLogin} 
 *   loading={isLoading}
 *   disabled={!isValid}
 * />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  testID = 'button',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={`${title} button`}
      accessibilityRole="button"
      accessibilityHint={`Triggers ${title} action`}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;
