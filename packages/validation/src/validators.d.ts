/**
 * Validation Utilities
 *
 * Platform-agnostic form validation functions
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
export interface FormValidationResult<T = any> {
    isValid: boolean;
    errors: Partial<T>;
}
export interface FieldValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    type?: 'email' | 'phone' | 'password' | 'url' | 'number';
    pattern?: RegExp;
    min?: number;
    max?: number;
}
export declare const validators: {
    required: (value: any) => ValidationResult;
    email: (value: string) => ValidationResult;
    phone: (value: string) => ValidationResult;
    password: (value: string) => ValidationResult;
    url: (value: string) => ValidationResult;
    number: (value: any) => ValidationResult;
    minLength: (min: number) => (value: string) => ValidationResult;
    maxLength: (max: number) => (value: string) => ValidationResult;
    min: (minValue: number) => (value: any) => ValidationResult;
    max: (maxValue: number) => (value: any) => ValidationResult;
    pattern: (regex: RegExp, errorMessage: string) => (value: string) => ValidationResult;
};
export declare const validateField: (value: any, rules: FieldValidationRules) => ValidationResult;
export declare const validateForm: <T extends Record<string, any>>(formData: T, rules: Record<keyof T, FieldValidationRules>) => FormValidationResult<T>;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const isStrongPassword: (password: string) => boolean;
export declare const isValidUrl: (url: string) => boolean;
//# sourceMappingURL=validators.d.ts.map