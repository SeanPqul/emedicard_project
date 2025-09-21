import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../common/LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders correctly by default', () => {
    const { getByTestId } = render(<LoadingSpinner />);
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  test('renders with custom size', () => {
    const { getByTestId } = render(<LoadingSpinner size="large" />);
    
    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
  });

  test('renders with custom color', () => {
    const { getByTestId } = render(<LoadingSpinner color="#FF0000" />);
    
    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
  });

  test('renders with text when provided', () => {
    const { getByText } = render(<LoadingSpinner text="Loading..." />);
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  test('does not render text when not provided', () => {
    const { queryByText } = render(<LoadingSpinner />);
    
    expect(queryByText('Loading')).toBeFalsy();
  });
});
