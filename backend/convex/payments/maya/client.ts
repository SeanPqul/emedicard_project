/**
 * Maya Payment Gateway API Client
 * Handles authentication, requests, and error handling for Maya API
 */

import { httpAction } from "../../_generated/server";
import { 
  MayaConfig, 
  MayaErrorResponse, 
  MayaCheckoutRequest,
  MayaCheckoutResponse,
  MayaPaymentStatus,
  PaymentEvent 
} from "./types";
import { MAYA_DEFAULTS, MAYA_ENDPOINTS, MAYA_HEADERS } from "./constants";

// Maya configuration from environment variables
const getMayaConfig = (): MayaConfig => ({
  apiUrl: process.env.MAYA_API_URL || 'https://pg-sandbox.paymaya.com',
  publicKey: process.env.MAYA_PUBLIC_KEY || '',
  secretKey: process.env.MAYA_SECRET_KEY || '',
  webhookSecret: process.env.MAYA_WEBHOOK_SECRET || '',
});

/**
 * Creates authorization headers for Maya API requests
 * @param useSecret - Whether to use secret key (for server-side operations) or public key
 * @returns Headers object with authorization
 */
export const createMayaHeaders = (useSecret = false): HeadersInit => {
  const config = getMayaConfig();
  const key = useSecret ? config.secretKey : config.publicKey;
  
  if (!key) {
    throw new Error(`Maya ${useSecret ? 'secret' : 'public'} key not configured`);
  }
  
  // Maya uses Basic Auth with base64 encoded key
  const encoded = Buffer.from(`${key}:`).toString('base64');
  
  return {
    [MAYA_HEADERS.AUTHORIZATION]: `Basic ${encoded}`,
    [MAYA_HEADERS.CONTENT_TYPE]: 'application/json',
    'Accept': 'application/json',
  };
};

/**
 * Makes an API call to Maya with retry logic and error handling
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param data - Request body data
 * @param useSecret - Whether to use secret key for authentication
 * @returns Response from Maya API
 */
export const mayaApiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  useSecret = false
): Promise<T> => {
  const config = getMayaConfig();
  const url = `${config.apiUrl}${endpoint}`;
  
  let lastError: Error | null = null;
  let attempt = 0;
  
  // Retry logic for transient failures
  while (attempt < MAYA_DEFAULTS.MAX_RETRY_ATTEMPTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        MAYA_DEFAULTS.REQUEST_TIMEOUT_MS
      );
      
      const response = await fetch(url, {
        method,
        headers: createMayaHeaders(useSecret),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is successful
      if (!response.ok) {
        const errorBody = await response.text();
        let errorData: MayaErrorResponse;
        
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = {
            error: 'PARSE_ERROR',
            message: errorBody || response.statusText,
            code: response.status.toString(),
          };
        }
        
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(
            `Maya API Error [${response.status}]: ${errorData.message || errorData.error || 'Request failed'}`
          );
        }
        
        // Retry server errors (5xx)
        lastError = new Error(
          `Maya API Error [${response.status}]: ${errorData.message || 'Server error'}`
        );
      } else {
        // Success - parse and return response
        const responseText = await response.text();
        if (!responseText) {
          return {} as T;
        }
        
        try {
          return JSON.parse(responseText);
        } catch {
          // Some endpoints return non-JSON responses
          return responseText as unknown as T;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a timeout error
        if (error.name === 'AbortError') {
          lastError = new Error('Maya API request timeout');
        } else {
          lastError = error;
        }
      } else {
        lastError = new Error('Unknown error occurred');
      }
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < MAYA_DEFAULTS.MAX_RETRY_ATTEMPTS - 1) {
      await new Promise(resolve => 
        setTimeout(resolve, MAYA_DEFAULTS.RETRY_DELAY_MS * Math.pow(2, attempt))
      );
    }
    
    attempt++;
  }
  
  // All retries exhausted
  throw lastError || new Error('Maya API request failed after all retries');
};

/**
 * Creates a checkout session with Maya
 * @param checkoutData - Checkout request data
 * @returns Checkout response with redirect URL
 */
export const createCheckoutSession = async (
  checkoutData: MayaCheckoutRequest
): Promise<MayaCheckoutResponse> => {
  return await mayaApiCall<MayaCheckoutResponse>(
    MAYA_ENDPOINTS.CHECKOUT_CREATE,
    'POST',
    checkoutData,
    true // Use secret key for checkout creation
  );
};

/**
 * Retrieves the status of a payment
 * @param paymentId - Maya payment ID
 * @returns Payment status information
 */
export const getPaymentStatus = async (
  paymentId: string
): Promise<MayaPaymentStatus> => {
  const endpoint = MAYA_ENDPOINTS.PAYMENT_GET.replace(':paymentId', paymentId);
  return await mayaApiCall<MayaPaymentStatus>(
    endpoint,
    'GET',
    undefined,
    true // Use secret key for payment status
  );
};

/**
 * Retrieves checkout session details
 * @param checkoutId - Maya checkout ID
 * @returns Checkout session information
 */
export const getCheckoutSession = async (
  checkoutId: string
): Promise<MayaCheckoutResponse> => {
  const endpoint = MAYA_ENDPOINTS.CHECKOUT_GET.replace(':checkoutId', checkoutId);
  return await mayaApiCall<MayaCheckoutResponse>(
    endpoint,
    'GET',
    undefined,
    false // Use public key for checkout retrieval
  );
};

/**
 * Validates webhook signature from Maya
 * @param signature - Signature from webhook header
 * @param payload - Raw webhook payload
 * @returns Boolean indicating if signature is valid
 */
export const validateWebhookSignature = async (
  signature: string,
  payload: string
): Promise<boolean> => {
  const config = getMayaConfig();

  if (!config.webhookSecret) {
    console.warn('Maya webhook secret not configured - skipping signature validation');
    return true; // In development, you might want to skip validation
  }

  // Implement proper HMAC-SHA256 signature validation for production security
  try {
    // Maya uses HMAC-SHA256 for webhook signature validation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(config.webhookSecret);
    const messageData = encoder.encode(payload);

    // Import the secret key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate HMAC signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Maya typically sends signature in hex format
    const receivedSignature = signature.toLowerCase().replace(/^sha256=/, '');
    const isValid = expectedSignature === receivedSignature;

    console.log('🔐 Webhook signature validation:', {
      valid: isValid,
      received: receivedSignature.substring(0, 16) + '...',
      expected: expectedSignature.substring(0, 16) + '...'
    });

    if (!isValid) {
      console.error('❌ Invalid webhook signature - potential security risk!');
      return false;
    }

    console.log('✅ Webhook signature validated successfully');
    return true;

  } catch (error) {
    console.error('❌ Error validating webhook signature:', error);

    // In development, allow unsigned webhooks but log warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Allowing unsigned webhook in development mode');
      return true;
    }

    // In production, reject invalid signatures
    return false;
  }
};

/**
 * Logs payment events for monitoring and debugging
 * @param event - Payment event to log
 */
export const logPaymentEvent = async (event: PaymentEvent): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  // Log to console for now - can be extended to store in database
  console.log('[Maya Payment Event]', {
    timestamp,
    ...event,
  });
  
  // TODO: Store in payment_logs table for audit trail
};
