export * from './hooks';
export { HealthCardExample } from './HealthCardExample';

// Export lib utilities via barrel export for proper path resolution in EAS builds
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
} from './lib';
