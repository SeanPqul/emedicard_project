/**
 * Validation Utilities
 *
 * Platform-agnostic form validation functions
 */
// ===== BASE VALIDATORS =====
export const validators = {
    required: (value) => {
        const isValid = value !== null && value !== undefined && String(value).trim() !== '';
        return isValid ? { valid: true } : { valid: false, error: 'This field is required' };
    },
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid email address' };
    },
    phone: (value) => {
        // Philippine phone number format
        const phoneRegex = /^(\+63|0)9\d{9}$/;
        const cleanValue = value.replace(/\s|-|\(|\)/g, ''); // Remove spaces, dashes, parentheses
        const isValid = phoneRegex.test(cleanValue);
        return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid Philippine phone number' };
    },
    password: (value) => {
        const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
        return isValid ? {
            valid: true
        } : {
            valid: false,
            error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        };
    },
    url: (value) => {
        try {
            // Basic URL validation without relying on browser URL constructor
            const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            const isValid = urlPattern.test(value);
            return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid URL' };
        }
        catch {
            return { valid: false, error: 'Please enter a valid URL' };
        }
    },
    number: (value) => {
        const num = Number(value);
        const isValid = !isNaN(num) && isFinite(num);
        return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid number' };
    },
    minLength: (min) => (value) => {
        const isValid = value && value.length >= min;
        return isValid ? { valid: true } : { valid: false, error: `Must be at least ${min} characters long` };
    },
    maxLength: (max) => (value) => {
        const isValid = !value || value.length <= max;
        return isValid ? { valid: true } : { valid: false, error: `Must be no more than ${max} characters long` };
    },
    min: (minValue) => (value) => {
        const num = Number(value);
        const isValid = !isNaN(num) && num >= minValue;
        return isValid ? { valid: true } : { valid: false, error: `Must be at least ${minValue}` };
    },
    max: (maxValue) => (value) => {
        const num = Number(value);
        const isValid = !isNaN(num) && num <= maxValue;
        return isValid ? { valid: true } : { valid: false, error: `Must be no more than ${maxValue}` };
    },
    pattern: (regex, errorMessage) => (value) => {
        const isValid = !value || regex.test(value);
        return isValid ? { valid: true } : { valid: false, error: errorMessage };
    }
};
// ===== FIELD VALIDATION =====
export const validateField = (value, rules) => {
    // Check required first
    if (rules.required) {
        const result = validators.required(value);
        if (!result.valid)
            return result;
    }
    // If value is empty and not required, it's valid
    if (!value || String(value).trim() === '') {
        return { valid: true };
    }
    // Check length constraints
    if (rules.minLength) {
        const result = validators.minLength(rules.minLength)(value);
        if (!result.valid)
            return result;
    }
    if (rules.maxLength) {
        const result = validators.maxLength(rules.maxLength)(value);
        if (!result.valid)
            return result;
    }
    // Check numeric constraints
    if (rules.min !== undefined) {
        const result = validators.min(rules.min)(value);
        if (!result.valid)
            return result;
    }
    if (rules.max !== undefined) {
        const result = validators.max(rules.max)(value);
        if (!result.valid)
            return result;
    }
    // Check type-specific validation
    if (rules.type === 'email') {
        return validators.email(value);
    }
    if (rules.type === 'phone') {
        return validators.phone(value);
    }
    if (rules.type === 'password') {
        return validators.password(value);
    }
    if (rules.type === 'url') {
        return validators.url(value);
    }
    if (rules.type === 'number') {
        return validators.number(value);
    }
    // Check pattern matching
    if (rules.pattern) {
        return validators.pattern(rules.pattern, 'Please enter a valid format')(value);
    }
    return { valid: true };
};
// ===== FORM VALIDATION =====
export const validateForm = (formData, rules) => {
    const errors = {};
    Object.entries(rules).forEach(([fieldName, validation]) => {
        const result = validateField(formData[fieldName], validation);
        if (!result.valid && result.error) {
            errors[fieldName] = result.error;
        }
    });
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
// ===== UTILITY VALIDATORS =====
export const isValidEmail = (email) => {
    return validators.email(email).valid;
};
export const isValidPhone = (phone) => {
    return validators.phone(phone).valid;
};
export const isStrongPassword = (password) => {
    return validators.password(password).valid;
};
export const isValidUrl = (url) => {
    return validators.url(url).valid;
};
