import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../CustomButton';

describe('CustomButton', () => {
  test('renders correctly with title', () => {
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={mockOnPress} />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('shows loading state when isLoading is true', () => {
    const { getByTestId } = render(
      <CustomButton title="Test Button" onPress={() => {}} isLoading />
    );
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  test('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={mockOnPress} disabled />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
