import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(getByText('No error')).toBeTruthy();
  });

  test('renders fallback UI when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  test('renders custom fallback UI when provided', () => {
    const CustomFallback = () => <Text>Custom error message</Text>;
    
    const { getByText } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('Custom error message')).toBeTruthy();
  });

  test('calls onError when an error occurs', () => {
    const mockOnError = jest.fn();
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });
});
