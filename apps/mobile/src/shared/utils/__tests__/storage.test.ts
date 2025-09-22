import { MMKV } from 'react-native-mmkv';
import { setItem, getItem, removeItem, clearStorage } from '@shared/lib/storage';

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

const mockStorage = new MMKV();

describe('Storage utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    test('stores string value correctly', () => {
      setItem('testKey', 'testValue');
      
      expect(mockStorage.set).toHaveBeenCalledWith('testKey', 'testValue');
    });

    test('stores object value as JSON string', () => {
      const testObject = { name: 'John', age: 30 };
      setItem('testKey', testObject);
      
      expect(mockStorage.set).toHaveBeenCalledWith('testKey', JSON.stringify(testObject));
    });
  });

  describe('getItem', () => {
    test('returns stored string value', () => {
      (mockStorage.getString as jest.Mock).mockReturnValue('testValue');
      
      const result = getItem('testKey');
      
      expect(mockStorage.getString).toHaveBeenCalledWith('testKey');
      expect(result).toBe('testValue');
    });

    test('returns parsed object value', () => {
      const testObject = { name: 'John', age: 30 };
      (mockStorage.getString as jest.Mock).mockReturnValue(JSON.stringify(testObject));
      
      const result = getItem('testKey');
      
      expect(result).toEqual(testObject);
    });

    test('returns null for non-existent key', () => {
      (mockStorage.getString as jest.Mock).mockReturnValue(undefined);
      
      const result = getItem('nonExistentKey');
      
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    test('removes item from storage', () => {
      removeItem('testKey');
      
      expect(mockStorage.delete).toHaveBeenCalledWith('testKey');
    });
  });

  describe('clearStorage', () => {
    test('clears all storage', () => {
      clearStorage();
      
      expect(mockStorage.clearAll).toHaveBeenCalled();
    });
  });
});
