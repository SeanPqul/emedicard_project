import { StyleSheet } from 'react-native';
import { getColor } from '@shared/styles/theme';
import { wp, hp, scaleFont as sp } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(3),
  },
  title: {
    fontSize: sp(24),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: sp(14),
    color: getColor('text.secondary'),
    marginBottom: hp(4),
    lineHeight: sp(20),
  },
  optionsContainer: {
    gap: hp(2),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('white'),
    borderRadius: 16,
    padding: wp(4),
    borderWidth: 2,
    borderColor: getColor('divider'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  iconContainer: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: getColor('primary.50'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: getColor('primary.500'),
  },
  optionContent: {
    flex: 1,
    marginLeft: wp(4),
    marginRight: wp(3),
  },
  optionTitle: {
    fontSize: sp(16),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: hp(0.5),
  },
  optionTitleSelected: {
    color: getColor('primary.600'),
  },
  optionDescription: {
    fontSize: sp(13),
    color: getColor('text.secondary'),
  },
  radioButton: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: getColor('divider'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: getColor('primary.500'),
  },
  radioButtonInner: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: getColor('primary.500'),
  },
});

export default styles;
