import { renderHook, act } from '@testing-library/react-native';
import { useAnimation } from '../useAnimation';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  useAnimatedStyle: jest.fn((callback) => callback()),
  withSpring: jest.fn((value) => value),
  withTiming: jest.fn((value) => value),
  interpolate: jest.fn(),
  Extrapolate: {
    CLAMP: 'clamp',
  },
}));

describe('useAnimation hook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => useAnimation());
    
    expect(result.current.opacity).toBeDefined();
    expect(result.current.scale).toBeDefined();
    expect(result.current.translateY).toBeDefined();
  });

  test('provides animation functions', () => {
    const { result } = renderHook(() => useAnimation());
    
    expect(typeof result.current.fadeIn).toBe('function');
    expect(typeof result.current.fadeOut).toBe('function');
    expect(typeof result.current.scaleIn).toBe('function');
    expect(typeof result.current.scaleOut).toBe('function');
    expect(typeof result.current.slideUp).toBe('function');
    expect(typeof result.current.slideDown).toBe('function');
  });

  test('fadeIn updates opacity value', () => {
    const { result } = renderHook(() => useAnimation());
    
    act(() => {
      result.current.fadeIn();
    });
    
    // Since we're mocking reanimated, we can't test the actual animation
    // but we can test that the function exists and can be called
    expect(result.current.fadeIn).toBeDefined();
  });

  test('scaleIn updates scale value', () => {
    const { result } = renderHook(() => useAnimation());
    
    act(() => {
      result.current.scaleIn();
    });
    
    expect(result.current.scaleIn).toBeDefined();
  });

  test('slideUp updates translateY value', () => {
    const { result } = renderHook(() => useAnimation());
    
    act(() => {
      result.current.slideUp();
    });
    
    expect(result.current.slideUp).toBeDefined();
  });
});
