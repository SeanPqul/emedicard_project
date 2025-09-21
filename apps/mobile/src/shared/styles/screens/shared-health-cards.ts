import { StyleSheet } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
  },
  cardContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    marginBottom: getSpacing('lg'),
    ...getShadow('small'),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
  },
  cardType: {
    ...getTypography('h3'),
    color: getColor('text.white'),
  },
  statusBadge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('sm'),
  },
  statusText: {
    ...getTypography('caption'),
    fontWeight: '600',
    color: getColor('text.white'),
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardId: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  cardDates: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('background.secondary'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  qrCodeWrapper: {
    padding: getSpacing('xs'),
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs'),
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    borderTopWidth: 1,
    borderTopColor: getColor('border.light'),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('background.secondary'),
    borderWidth: 1,
    borderColor: getColor('primary.main'),
  },
  actionButtonText: {
    ...getTypography('body'),
    color: getColor('primary.main'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  renewButton: {
    backgroundColor: getColor('primary.main'),
  },
  renewButtonText: {
    color: getColor('text.white'),
  },
});