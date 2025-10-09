export * from './hooks';
export { HealthCardExample } from './HealthCardExample';

// Export lib utilities directly from source file for EAS build compatibility
export {
  type HealthCardData,
  type BackendHealthCard,
  getCardColor,
  getCardStatus,
  getStatusColor,
  generateVerificationUrl,
  formatDate,
  generateCardHtml,
  getHealthCardTypeName,
  getPaymentMethods
} from './lib/health-card-display-utils';
