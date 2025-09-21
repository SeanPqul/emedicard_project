import { StyleSheet } from 'react-native';
import { getColor } from '@/src/styles/theme';
import { wp, hp, scaleFont as sp } from '@/src/utils/responsive';

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
    marginBottom: hp(3),
    lineHeight: sp(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  categoriesGrid: {
    gap: hp(1.5),
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('white'),
    borderRadius: 12,
    padding: wp(4),
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
  categoryCardSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  colorIndicator: {
    width: wp(10),
    height: wp(10),
    borderRadius: 8,
    marginRight: wp(3),
  },
  categoryName: {
    flex: 1,
    fontSize: sp(15),
    fontWeight: '500',
    color: getColor('text.primary'),
  },
  categoryNameSelected: {
    color: getColor('primary.600'),
    fontWeight: '600',
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('accent.warningOrange') + '15',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: 12,
    marginRight: wp(2),
  },
  orientationText: {
    fontSize: sp(11),
    color: getColor('accent.warningOrange'),
    marginLeft: wp(1),
    fontWeight: '500',
  },
  checkmark: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    borderWidth: 1.5,
    borderColor: getColor('divider'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkSelected: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.500'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: sp(14),
    color: getColor('text.secondary'),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(8),
  },
  emptyText: {
    marginTop: hp(2),
    fontSize: sp(14),
    color: getColor('text.secondary'),
  },
});

export default styles;
