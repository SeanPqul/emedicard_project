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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
  },
  scannerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('lg'),
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('xxl'),
  },
  instructionsTitle: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    marginBottom: getBorderRadius('lg'),
    textAlign: 'center',
  },
  instructionsText: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: getSpacing('xxxxl'),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});