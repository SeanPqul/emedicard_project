/**
 * Data Formatting Utilities
 * 
 * Centralized functions for formatting various types of data
 */

// ===== DATE FORMATTERS =====

export const dateFormatters = {
  // Format date to YYYY-MM-DD
  toISODate: (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Format date to human-readable format
  toDisplayDate: (date: Date | string | number, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format date to short format
  toShortDate: (date: Date | string | number, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format timestamp to relative time
  toRelativeTime: (date: Date | string | number): string => {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  },

  // Format time to HH:MM format
  toTime: (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  // Format datetime for display
  toDateTime: (date: Date | string | number, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
};

// ===== CURRENCY FORMATTERS =====

export const currencyFormatters = {
  // Format to Philippine Peso
  toPHP: (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  },

  // Format to PHP without symbol
  toPHPNumber: (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // Format with currency code
  toPHPWithCode: (amount: number): string => {
    return `PHP ${currencyFormatters.toPHPNumber(amount)}`;
  },

  // Format for display in cards/summaries
  toPHPCompact: (amount: number): string => {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₱${(amount / 1000).toFixed(1)}K`;
    }
    return `₱${amount.toFixed(0)}`;
  },
};

// ===== STRING FORMATTERS =====

export const stringFormatters = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Camel case to readable
  camelToReadable: (str: string): string => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  },

  // Truncate with ellipsis
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  // Extract initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  // Format phone number for display
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('63')) {
      // +63 format
      const number = cleaned.substring(2);
      return `+63 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    
    if (cleaned.startsWith('0')) {
      // 0 format
      const number = cleaned.substring(1);
      return `0${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    
    return phone;
  },

  // Mask sensitive data
  maskEmail: (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  },

  maskPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    
    return cleaned.substring(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.substring(cleaned.length - 3);
  },
};

// ===== FILE SIZE FORMATTERS =====

export const fileSizeFormatters = {
  // Format bytes to human readable
  toHumanReadable: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Convert to specific units
  toKB: (bytes: number): string => `${(bytes / 1024).toFixed(2)} KB`,
  toMB: (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)} MB`,
  toGB: (bytes: number): string => `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`,
};

// ===== ID/REFERENCE FORMATTERS =====

export const idFormatters = {
  // Format application ID for display
  formatApplicationId: (id: string): string => {
    return `APP-${id.substring(0, 8).toUpperCase()}`;
  },

  // Format payment reference
  formatPaymentReference: (ref: string): string => {
    return `PAY-${ref.toUpperCase()}`;
  },

  // Format health card number
  formatHealthCardNumber: (cardNumber: string): string => {
    // Format as XXXX-XXXX-XXXX-XXXX
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.replace(/(.{4})/g, '$1-').slice(0, -1);
  },

  // Generate display-friendly IDs
  generateDisplayId: (prefix: string, timestamp?: number): string => {
    const time = timestamp || Date.now();
    const shortId = time.toString(36).toUpperCase();
    return `${prefix}-${shortId}`;
  },
};

// ===== STATUS FORMATTERS =====

export const statusFormatters = {
  // Format application status for display
  formatApplicationStatus: (status: string): { text: string; color: string } => {
    const statusMap = {
      'Submitted': { text: 'Submitted', color: '#3B82F6' },
      'Under Review': { text: 'Under Review', color: '#F59E0B' },
      'Approved': { text: 'Approved', color: '#10B981' },
      'Rejected': { text: 'Rejected', color: '#EF4444' },
    };
    
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#6B7280' };
  },

  // Format payment status
  formatPaymentStatus: (status: string): { text: string; color: string } => {
    const statusMap = {
      'Pending': { text: 'Pending', color: '#F59E0B' },
      'Complete': { text: 'Complete', color: '#10B981' },
      'Failed': { text: 'Failed', color: '#EF4444' },
    };
    
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#6B7280' };
  },

  // Format health card status
  formatHealthCardStatus: (status: string): { text: string; color: string } => {
    const statusMap = {
      'Active': { text: 'Active', color: '#10B981' },
      'Expired': { text: 'Expired', color: '#EF4444' },
      'Suspended': { text: 'Suspended', color: '#F59E0B' },
      'Revoked': { text: 'Revoked', color: '#EF4444' },
    };
    
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#6B7280' };
  },
};

// ===== UTILITY FUNCTIONS =====

export const formatUtils = {
  // Safe number parsing
  parseNumber: (value: any): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  },

  // Safe string conversion
  toString: (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  },

  // Format percentage
  toPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Format duration in milliseconds
  formatDuration: (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  },
};