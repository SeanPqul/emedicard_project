import { StyleSheet } from 'react-native';
import { getColor } from '@shared/styles/theme';
import { wp, hp, scaleFont as sp } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
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
    marginBottom: hp(3),
    lineHeight: sp(20),
  },
  progressContainer: {
    backgroundColor: getColor('white'),
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  progressLabel: {
    fontSize: sp(14),
    color: getColor('text.secondary'),
  },
  progressValue: {
    fontSize: sp(14),
    fontWeight: '600',
    color: getColor('primary.600'),
  },
  progressBar: {
    height: hp(1),
    backgroundColor: getColor('divider'),
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: getColor('primary.500'),
    borderRadius: 5,
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: sp(16),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: hp(2),
  },
  documentCard: {
    backgroundColor: getColor('white'),
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1.5,
    borderColor: getColor('divider'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  documentCardUploaded: {
    borderColor: getColor('accent.safetyGreen'),
    backgroundColor: getColor('accent.safetyGreen') + '08',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  documentIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: getColor('primary.50'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  documentIconContainerUploaded: {
    backgroundColor: getColor('accent.safetyGreen'),
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  documentTitle: {
    fontSize: sp(15),
    fontWeight: '600',
    color: getColor('text.primary'),
  },
  optionalBadge: {
    fontSize: sp(11),
    color: getColor('text.secondary'),
    backgroundColor: getColor('divider'),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: 10,
    marginLeft: wp(2),
  },
  documentDescription: {
    fontSize: sp(13),
    color: getColor('text.secondary'),
    lineHeight: sp(18),
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedText: {
    fontSize: sp(13),
    color: getColor('accent.safetyGreen'),
    marginLeft: wp(1.5),
    flex: 1,
  },
  removeButton: {
    padding: wp(1),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('primary.50'),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    fontSize: sp(14),
    color: getColor('primary.600'),
    fontWeight: '500',
    marginLeft: wp(1.5),
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: getColor('accent.warningOrange') + '15',
    borderRadius: 12,
    padding: wp(4),
    marginTop: hp(2),
  },
  tipContent: {
    flex: 1,
    marginLeft: wp(2),
  },
  tipTitle: {
    fontSize: sp(14),
    fontWeight: '600',
    color: getColor('accent.warningOrange'),
    marginBottom: hp(1),
  },
  tipText: {
    fontSize: sp(12),
    color: getColor('accent.warningOrange'),
    lineHeight: sp(16),
    marginBottom: hp(0.3),
  },
});

export default styles;
