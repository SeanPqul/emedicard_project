import { Dimensions } from 'react-native';
import { 
  widthPercentageToDP, 
  heightPercentageToDP, 
  isTablet, 
  getDeviceType,
  getOrientation 
} from '../responsive';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
}));

const mockDimensions = Dimensions.get as jest.Mock;

describe('Responsive utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('widthPercentageToDP', () => {
    test('calculates width percentage correctly', () => {
      mockDimensions.mockReturnValue({ width: 400, height: 800 });
      
      const result = widthPercentageToDP(50);
      
      expect(result).toBe(200); // 50% of 400
    });

    test('handles edge cases', () => {
      mockDimensions.mockReturnValue({ width: 400, height: 800 });
      
      expect(widthPercentageToDP(0)).toBe(0);
      expect(widthPercentageToDP(100)).toBe(400);
    });
  });

  describe('heightPercentageToDP', () => {
    test('calculates height percentage correctly', () => {
      mockDimensions.mockReturnValue({ width: 400, height: 800 });
      
      const result = heightPercentageToDP(25);
      
      expect(result).toBe(200); // 25% of 800
    });
  });

  describe('isTablet', () => {
    test('returns true for tablet dimensions', () => {
      mockDimensions.mockReturnValue({ width: 768, height: 1024 });
      
      const result = isTablet();
      
      expect(result).toBe(true);
    });

    test('returns false for phone dimensions', () => {
      mockDimensions.mockReturnValue({ width: 375, height: 667 });
      
      const result = isTablet();
      
      expect(result).toBe(false);
    });
  });

  describe('getDeviceType', () => {
    test('returns tablet for large screens', () => {
      mockDimensions.mockReturnValue({ width: 768, height: 1024 });
      
      const result = getDeviceType();
      
      expect(result).toBe('tablet');
    });

    test('returns phone for small screens', () => {
      mockDimensions.mockReturnValue({ width: 375, height: 667 });
      
      const result = getDeviceType();
      
      expect(result).toBe('phone');
    });
  });

  describe('getOrientation', () => {
    test('returns portrait when height > width', () => {
      mockDimensions.mockReturnValue({ width: 375, height: 667 });
      
      const result = getOrientation();
      
      expect(result).toBe('portrait');
    });

    test('returns landscape when width > height', () => {
      mockDimensions.mockReturnValue({ width: 667, height: 375 });
      
      const result = getOrientation();
      
      expect(result).toBe('landscape');
    });
  });
});
