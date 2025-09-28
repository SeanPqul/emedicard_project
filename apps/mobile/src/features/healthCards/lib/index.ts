/**
 * Health Cards Feature - Lib Module
 * 
 * This module exports utility functions for health card display and management
 */

export {
  // Types
  type HealthCardData,
  type BackendHealthCard,
  
  // Display utilities
  getCardColor,
  getCardStatus,
  getStatusColor,
  generateVerificationUrl,
  formatDate,
  generateCardHtml,
  
  // Helper functions
  getHealthCardTypeName,
  getPaymentMethods
} from './health-card-display-utils';
