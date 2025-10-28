/**
 * Timezone utility tests
 * 
 * Tests for Philippine Time (PHT) timezone conversions
 */

import { getStartOfDay } from '../utils';

describe('getStartOfDay - Philippine Time', () => {
  // Mock a specific date/time for consistent testing
  const testDate = new Date('2025-01-28T10:30:00Z'); // 10:30 AM UTC = 6:30 PM PHT (same day)
  const testDateNextDay = new Date('2025-01-28T16:30:00Z'); // 4:30 PM UTC = 12:30 AM PHT (next day)

  it('should return start of day in Philippine Time for current date', () => {
    const result = getStartOfDay(testDate);
    const resultDate = new Date(result);
    
    // Expected: Jan 28, 2025 00:00:00 PHT = Jan 27, 2025 16:00:00 UTC
    expect(resultDate.toISOString()).toBe('2025-01-27T16:00:00.000Z');
  });

  it('should handle date that crosses to next day in PHT', () => {
    const result = getStartOfDay(testDateNextDay);
    const resultDate = new Date(result);
    
    // Expected: Jan 29, 2025 00:00:00 PHT = Jan 28, 2025 16:00:00 UTC
    expect(resultDate.toISOString()).toBe('2025-01-28T16:00:00.000Z');
  });

  it('should be consistent regardless of device timezone', () => {
    // Test with the same UTC timestamp multiple times
    const result1 = getStartOfDay(testDate.getTime());
    const result2 = getStartOfDay(new Date(testDate));
    const result3 = getStartOfDay(testDate.toISOString());
    
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('should handle midnight PHT correctly', () => {
    // Jan 28, 2025 00:00:00 PHT = Jan 27, 2025 16:00:00 UTC
    const midnightPHT = new Date('2025-01-27T16:00:00Z');
    const result = getStartOfDay(midnightPHT);
    
    expect(result).toBe(midnightPHT.getTime());
  });

  it('should handle date near end of day in PHT', () => {
    // Jan 28, 2025 23:59:59 PHT = Jan 28, 2025 15:59:59 UTC
    const endOfDayPHT = new Date('2025-01-28T15:59:59Z');
    const result = getStartOfDay(endOfDayPHT);
    const resultDate = new Date(result);
    
    // Should still return start of Jan 28 PHT
    expect(resultDate.toISOString()).toBe('2025-01-27T16:00:00.000Z');
  });

  it('should default to current time when no argument provided', () => {
    const result = getStartOfDay();
    const now = Date.now();
    
    // Should be a valid timestamp
    expect(typeof result).toBe('number');
    expect(result).toBeLessThanOrEqual(now);
    
    // Should be within the last 24 hours
    expect(result).toBeGreaterThan(now - 24 * 60 * 60 * 1000);
  });
});
