import { StyleSheet } from 'react-native';
import { getColor, getSpacing } from '@shared/styles/theme';
import { verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(50), // Space for tab bar + extra padding
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('background.primary'),
  },
});
