/**
 * Payment Constants
 * 
 * Constants related to payment processing
 */

// ===== PAYMENT STATUS CONSTANTS =====
export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  COMPLETE: 'Complete',
  FAILED: 'Failed'
} as const;

export const PAYMENT_METHODS = {
  GCASH: 'Gcash',
  MAYA: 'Maya',
  BARANGAY_HALL: 'BaranggayHall',
  CITY_HALL: 'CityHall'
} as const;

// ===== PAYMENT METHOD DISPLAY NAMES =====
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.GCASH]: 'GCash',
  [PAYMENT_METHODS.MAYA]: 'Maya (PayMaya)',
  [PAYMENT_METHODS.BARANGAY_HALL]: 'Barangay Hall',
  [PAYMENT_METHODS.CITY_HALL]: 'City Hall'
} as const;

// ===== PAYMENT FEES =====
export const PAYMENT_FEES = {
  BASE_AMOUNT: 200, // PHP 200 base fee
  SERVICE_FEE_PERCENTAGE: 0.025, // 2.5% service fee for digital payments
  MIN_SERVICE_FEE: 5, // Minimum PHP 5 service fee
  MAX_SERVICE_FEE: 50, // Maximum PHP 50 service fee
  CASH_PAYMENT_FEE: 0 // No service fee for cash payments
} as const;

// ===== PAYMENT PROCESSING TIMES =====
export const PROCESSING_TIMES = {
  [PAYMENT_METHODS.GCASH]: {
    estimated: '5-15 minutes',
    maxHours: 24
  },
  [PAYMENT_METHODS.MAYA]: {
    estimated: '5-15 minutes', 
    maxHours: 24
  },
  [PAYMENT_METHODS.BARANGAY_HALL]: {
    estimated: 'Immediate',
    maxHours: 1
  },
  [PAYMENT_METHODS.CITY_HALL]: {
    estimated: 'Immediate',
    maxHours: 1
  }
} as const;

// ===== PAYMENT VALIDATION CONSTANTS =====
export const PAYMENT_VALIDATION = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000,
  CURRENCY: 'PHP',
  REFERENCE_NUMBER_PATTERNS: {
    [PAYMENT_METHODS.GCASH]: /^[A-Za-z0-9]{8,15}$/,
    [PAYMENT_METHODS.MAYA]: /^[A-Za-z0-9]{8,15}$/,
    [PAYMENT_METHODS.BARANGAY_HALL]: /^[A-Za-z0-9-]{6,20}$/,
    [PAYMENT_METHODS.CITY_HALL]: /^[A-Za-z0-9-]{6,20}$/
  }
} as const;

// ===== PAYMENT STATUS COLORS =====
export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUSES.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [PAYMENT_STATUSES.COMPLETE]: { bg: 'bg-green-100', text: 'text-green-800' },
  [PAYMENT_STATUSES.FAILED]: { bg: 'bg-red-100', text: 'text-red-800' }
} as const;