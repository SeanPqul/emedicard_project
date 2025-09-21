import { StyleSheet } from 'react-native';
import { getColor } from '@shared/styles/theme';
import { wp, hp, scaleFont as sp } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: hp(3),
    paddingBottom: hp(4),
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
  inputGroup: {
    marginBottom: hp(3),
  },
  inputLabel: {
    fontSize: sp(14),
    fontWeight: '500',
    color: getColor('text.primary'),
    marginBottom: hp(1),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('white'),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: getColor('divider'),
    paddingHorizontal: wp(4),
    minHeight: hp(7),
  },
  inputContainerError: {
    borderColor: getColor('semantic.error'),
  },
  inputContainerMultiline: {
    minHeight: hp(12),
    alignItems: 'flex-start',
    paddingVertical: hp(1.5),
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    fontSize: sp(15),
    color: getColor('text.primary'),
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: hp(9),
  },
  errorText: {
    fontSize: sp(12),
    color: getColor('semantic.error'),
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  civilStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  civilStatusOption: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: getColor('divider'),
    backgroundColor: getColor('white'),
  },
  civilStatusOptionSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  civilStatusText: {
    fontSize: sp(14),
    color: getColor('text.secondary'),
  },
  civilStatusTextSelected: {
    color: getColor('primary.600'),
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: getColor('primary.50'),
    borderRadius: 12,
    padding: wp(4),
    marginTop: hp(2),
  },
  infoText: {
    flex: 1,
    fontSize: sp(13),
    color: getColor('primary.700'),
    marginLeft: wp(2),
    lineHeight: sp(18),
  },
});

export default styles;
