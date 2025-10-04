// Mock React Native modules
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => 'Icon');

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock theme
jest.mock('@shared/styles/theme', () => ({
  theme: {
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f5',
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
        inverse: '#ffffff',
      },
      border: {
        light: '#e0e0e0',
        medium: '#d0d0d0',
      },
      status: {
        error: '#ef4444',
        warning: '#f59e0b',
      },
      brand: {
        primary: '#10b981',
      },
      semantic: {
        error: '#ef4444',
      },
      accent: {
        warningOrange: '#f59e0b',
        safetyGreen: '#10b981',
      },
    },
    borderRadius: {
      md: 8,
      lg: 12,
      full: 9999,
    },
    shadows: {
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  },
}));

// Mock responsive utilities
jest.mock('@shared/utils/responsive', () => ({
  scale: jest.fn((n) => n),
  verticalScale: jest.fn((n) => n),
  moderateScale: jest.fn((n) => n),
}));

// Global test configuration
global.__DEV__ = true;
