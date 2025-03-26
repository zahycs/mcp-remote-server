import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    backgroundColor: colors.white,
    marginBottom: 0
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.white,
    opacity: 0.99 // Fix for iOS WebView rendering
  },
  noContent: {
    fontSize: 16,
    color: colors.dark,
    textAlign: 'center',
    marginTop: 20
  }
});
