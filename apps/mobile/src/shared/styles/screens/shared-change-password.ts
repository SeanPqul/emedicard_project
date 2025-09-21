import { StyleSheet } from 'react-native';
import { getColor, getSpacing, getTypography } from '../theme';

export const styles = StyleSheet.create({
  title: {
    ...getTypography('h4'),
    textAlign: 'center',
    marginVertical: getSpacing('md'),
    color: getColor('text.primary'),
  },
  input: {
    borderColor: getColor('border.light'),
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: getSpacing('sm'),
    padding: getSpacing('sm'),
  },
});
