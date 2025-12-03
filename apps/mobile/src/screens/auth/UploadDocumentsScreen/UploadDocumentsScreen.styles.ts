import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { getColor } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(20),
    backgroundColor: getColor('background.primary'),
  },
  header: {
    marginBottom: verticalScale(30),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: getColor('text.primary'),
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: getColor('text.secondary'),
    lineHeight: moderateScale(22),
  },
  uploadArea: {
    borderWidth: moderateScale(2),
    borderColor: getColor('border.light'),
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('background.secondary'),
    marginBottom: verticalScale(20),
  },
  uploadIcon: {
    marginBottom: verticalScale(10),
  },
  uploadText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: getColor('semantic.info'),
    marginBottom: verticalScale(4),
  },
  uploadSubtext: {
    fontSize: moderateScale(12),
    color: getColor('text.tertiary'),
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.secondary'),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(20),
    minHeight: verticalScale(60), // Ensure minimum height
  },
  fileName: {
    fontSize: moderateScale(14),
    color: getColor('text.primary'),
    fontWeight: '500',
  },
  fileSize: {
    fontSize: moderateScale(12),
    color: getColor('text.tertiary'),
    marginTop: verticalScale(4),
  },
  removeButton: {
    padding: scale(4),
  },
  button: {
    marginTop: 'auto',
  },

  // Info Box Styles
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(16),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  infoTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#0C4A6E',
  },
  infoList: {
    gap: verticalScale(6),
    paddingLeft: scale(28),
  },
  infoItem: {
    fontSize: moderateScale(13),
    color: '#0369A1',
  },

  // Banner Styles
  rejectionBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  rejectionText: {
    color: '#B91C1C',
    flex: 1,
    fontSize: moderateScale(14),
  },

  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  warningText: {
    color: '#92400E',
    flex: 1,
    fontSize: moderateScale(13),
  },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  errorText: {
    color: '#B91C1C',
    flex: 1,
    fontSize: moderateScale(13),
  },

  fileDetailsContainer: {
    flex: 1,
    marginHorizontal: scale(8),
    justifyContent: 'center',
  },

  // Document Type Selector Styles
  documentTypeSection: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
  },
  selectorTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: verticalScale(10),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.secondary'),
    borderWidth: moderateScale(2),
    borderColor: getColor('border.light'),
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(8),
  },
  radioOptionSelected: {
    borderColor: getColor('semantic.info'),
    backgroundColor: '#F0F9FF',
  },
  radioOptionDisabled: {
    opacity: 0.6,
  },
  radioCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: moderateScale(2),
    borderColor: getColor('border.default'),
    marginRight: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: getColor('semantic.info'),
  },
  radioInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: getColor('semantic.info'),
  },
  radioLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: verticalScale(2),
  },
  radioDescription: {
    fontSize: moderateScale(12),
    color: getColor('text.secondary'),
    lineHeight: moderateScale(16),
  },
});
