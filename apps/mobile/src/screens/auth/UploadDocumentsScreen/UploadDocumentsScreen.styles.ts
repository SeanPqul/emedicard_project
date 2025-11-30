import { StyleSheet } from 'react-native';
import { moderateScale } from '@shared/utils/responsive';
import { getColor } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),
    backgroundColor: getColor('background.primary'),
  },
  header: {
    marginBottom: moderateScale(30),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: getColor('text.primary'),
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: getColor('text.secondary'),
    lineHeight: moderateScale(22),
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: getColor('border.light'),
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    padding: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('background.secondary'),
    marginBottom: moderateScale(20),
  },
  uploadIcon: {
    marginBottom: moderateScale(10),
  },
  uploadText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: getColor('semantic.info'), // or primary
    marginBottom: moderateScale(4),
  },
  uploadSubtext: {
    fontSize: moderateScale(12),
    color: getColor('text.tertiary'),
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.secondary'),
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(20),
  },
  fileName: {
    flex: 1,
    fontSize: moderateScale(14),
    color: getColor('text.primary'),
    marginLeft: moderateScale(10),
  },
  removeButton: {
    padding: moderateScale(4),
  },
  button: {
    marginTop: 'auto',
  },
  errorText: {
    color: getColor('semantic.error'),
    marginTop: moderateScale(8),
    fontSize: moderateScale(14),
  }
});
