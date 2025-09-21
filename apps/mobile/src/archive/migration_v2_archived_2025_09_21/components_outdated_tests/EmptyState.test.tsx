import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../common/EmptyState';

describe('EmptyState', () => {
  test('renders correctly with title and message', () => {
    const { getByText } = render(
      <EmptyState
        title="No Data"
        message="There is no data to display"
      />
    );
    
    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('There is no data to display')).toBeTruthy();
  });

  test('renders with icon when provided', () => {
    const { getByTestId } = render(
      <EmptyState
        title="No Data"
        message="There is no data to display"
        icon="inbox"
      />
    );
    
    expect(getByTestId('empty-state-icon')).toBeTruthy();
  });

  test('renders with action button when provided', () => {
    const mockAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        title="No Data"
        message="There is no data to display"
        actionText="Retry"
        onAction={mockAction}
      />
    );
    
    const actionButton = getByText('Retry');
    expect(actionButton).toBeTruthy();
    
    fireEvent.press(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  test('does not render action button when not provided', () => {
    const { queryByText } = render(
      <EmptyState
        title="No Data"
        message="There is no data to display"
      />
    );
    
    expect(queryByText('Retry')).toBeFalsy();
  });
});
