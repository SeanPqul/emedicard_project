/**
 * API Constants
 * 
 * Constants related to API calls, endpoints, and data handling.
 */

export const API_CONSTANTS = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  } as const,

  // Request Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
  } as const,

  // Content Types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
  } as const,

  // Response Formats
  RESPONSE_FORMATS: {
    JSON: 'json',
    BLOB: 'blob',
    TEXT: 'text',
  } as const,
} as const;

export type ApiConstants = typeof API_CONSTANTS;
