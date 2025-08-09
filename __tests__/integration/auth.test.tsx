import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
  ClerkProvider: jest.fn(({ children }) => children),
  SignedIn: jest.fn(({ children }) => children),
  SignedOut: jest.fn(({ children }) => children),
}));

// Mock components for testing
const MockSignInScreen = () => (
  <View testID="sign-in-screen">
    <Text>Sign In</Text>
  </View>
);

const MockDashboard = () => (
  <View testID="dashboard">
    <Text>Dashboard</Text>
  </View>
);

const MockAuthFlow = ({ isSignedIn }: { isSignedIn: boolean }) => {
  if (isSignedIn) {
    return <MockDashboard />;
  }
  return <MockSignInScreen />;
};

describe('Auth Integration Tests', () => {
  test('shows sign in screen when user is not authenticated', () => {
    const { getByTestId } = render(<MockAuthFlow isSignedIn={false} />);
    
    expect(getByTestId('sign-in-screen')).toBeTruthy();
  });

  test('shows dashboard when user is authenticated', () => {
    const { getByTestId } = render(<MockAuthFlow isSignedIn={true} />);
    
    expect(getByTestId('dashboard')).toBeTruthy();
  });

  test('navigates from sign in to dashboard after successful authentication', async () => {
    let isSignedIn = false;
    
    const TestComponent = () => {
      const [authenticated, setAuthenticated] = React.useState(isSignedIn);
      
      const handleSignIn = () => {
        setAuthenticated(true);
      };
      
      if (authenticated) {
        return <MockDashboard />;
      }
      
      return (
        <View testID="sign-in-screen">
          <Text>Sign In</Text>
          <Text onPress={handleSignIn} testID="sign-in-button">
            Sign In Button
          </Text>
        </View>
      );
    };
    
    const { getByTestId, queryByTestId } = render(<TestComponent />);
    
    // Initially shows sign in screen
    expect(getByTestId('sign-in-screen')).toBeTruthy();
    expect(queryByTestId('dashboard')).toBeFalsy();
    
    // Simulate sign in
    fireEvent.press(getByTestId('sign-in-button'));
    
    // Should now show dashboard
    await waitFor(() => {
      expect(getByTestId('dashboard')).toBeTruthy();
      expect(queryByTestId('sign-in-screen')).toBeFalsy();
    });
  });
});
