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
  content: {
    flex: 1,
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('xxxl') + 16,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('lg'),
    borderRadius: getBorderRadius('xl'),
    ...getShadow('medium'),
    marginBottom: getSpacing('xxl'),
  },
  cardInfo: {
    alignItems: 'center',
    marginBottom: getSpacing('xxl'),
  },
  cardTitle: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  cardId: {
    ...getTypography('h3'),
    color: getColor('primary.main'),
    marginBottom: getSpacing('md'),
  },
  cardDetail: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  instructionsContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('xxl'),
    width: '100%',
  },
  instructionsTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('lg'),
  },
  instructionsText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.primary'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    borderWidth: 1,
    borderColor: getColor('primary.main'),
    ...getShadow('small'),
  },
  actionButtonText: {
    ...getTypography('body'),
    color: getColor('primary.main'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
});