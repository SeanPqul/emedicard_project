import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../theme';

export const modalStyles = StyleSheet.create({
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // Modal Container
  modalContainer: {
    backgroundColor: getColor('background.primary'),
    borderTopLeftRadius: getBorderRadius('xl'),
    borderTopRightRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
  },

  // Modal Title
  modalTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('lg'),
  },

  // Modal Options
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    backgroundColor: getColor('background.secondary'),
    marginBottom: getSpacing('sm'),
  },
  modalOptionText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('md'),
  },

  // Modal Cancel Button
  modalCancelButton: {
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
  },
  modalCancelText: {
    ...getTypography('body'),
    color: getColor('semantic.error'),
    fontWeight: '600',
  },

  // Image Picker Modal Specific
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    backgroundColor: getColor('background.secondary'),
    marginBottom: getSpacing('sm'),
  },
  imagePickerOptionText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('md'),
  },
});