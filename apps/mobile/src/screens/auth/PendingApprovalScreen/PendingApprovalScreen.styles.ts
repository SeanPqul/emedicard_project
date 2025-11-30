import { StyleSheet } from 'react-native';
import { moderateScale } from '@shared/utils/responsive';
import { getColor } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),
    justifyContent: 'space-between',
    backgroundColor: getColor('background.primary'),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
  },
  iconContainer: {
    marginBottom: moderateScale(30),
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    padding: 6,
    borderWidth: 4,
    borderColor: getColor('background.primary'),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: moderateScale(12),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: moderateScale(30),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: getColor('background.secondary'),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: getColor('text.secondary'),
    lineHeight: moderateScale(20),
  },
  footer: {
    gap: moderateScale(10),
    marginBottom: moderateScale(20),
  },
  button: {
    width: '100%',
  },
  signOutButton: {
    width: '100%',
    marginTop: moderateScale(10),
    minHeight: moderateScale(48),
    paddingVertical: moderateScale(12),
  }
});
