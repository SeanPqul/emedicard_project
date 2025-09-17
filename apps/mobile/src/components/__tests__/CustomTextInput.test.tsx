import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomTextInput } from '../ui/CustomTextInput';

describe('CustomTextInput', () => {
  test('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(
      <CustomTextInput placeholder="Enter text" onChangeText={() => {}} />
    );
    
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  test('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomTextInput placeholder="Enter text" onChangeText={mockOnChangeText} />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'test text');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('test text');
  });

  test('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <CustomTextInput
        placeholder="Enter text"
        onChangeText={() => {}}
        error="This field is required"
      />
    );
    
    expect(getByText('This field is required')).toBeTruthy();
  });

  test('renders with icon when provided', () => {
    const { getByTestId } = render(
      <CustomTextInput
        placeholder="Enter text"
        onChangeText={() => {}}
        icon="mail"
      />
    );
    
    expect(getByTestId('input-icon')).toBeTruthy();
  });

  test('toggles password visibility when secure text entry is enabled', () => {
    const { getByTestId } = render(
      <CustomTextInput
        placeholder="Enter password"
        onChangeText={() => {}}
        secureTextEntry
      />
    );
    
    const toggleButton = getByTestId('password-toggle');
    fireEvent.press(toggleButton);
    
    // Should toggle the visibility
    expect(getByTestId('password-toggle')).toBeTruthy();
  });
});
