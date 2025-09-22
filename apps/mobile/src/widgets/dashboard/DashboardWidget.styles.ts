import { StyleSheet } from 'react-native';
import { getColor } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
