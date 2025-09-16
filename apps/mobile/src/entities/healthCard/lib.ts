import type { HealthCard, HealthCardData } from './model';

/**
 * Health Card Entity - Utility Functions
 * Pure functions for health card operations and calculations
 */

// ===== STATUS & COLOR UTILITIES =====

/**
 * Get display color for health card based on job category
 */
export const getCardColor = (jobCategory?: { colorCode: string }): string => {
  if (!jobCategory?.colorCode) return '#6B7280'; // Default gray
  return jobCategory.colorCode;
};

/**
 * Get status color for health card
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Active': '#10B981',      // Green
    'Expired': '#EF4444',     // Red
    'Suspended': '#F59E0B',   // Yellow
    'Revoked': '#DC2626',     // Dark red
    'Processing': '#6B7280',  // Gray
  };

  return statusColors[status] || '#6B7280';
};

/**
 * Get display status for health card
 */
export const getCardStatus = (card: HealthCardData): string => {
  if (!card.cardUrl) return 'Processing';
  if (card.expiresAt && Date.now() > card.expiresAt) return 'Expired';
  return card.status || 'Active';
};

// ===== DATE & TIME UTILITIES =====

/**
 * Format date for display
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if health card is expired
 */
export const isExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
};

/**
 * Get days until expiration
 */
export const getDaysUntilExpiration = (expiresAt?: number): number => {
  if (!expiresAt) return 0;
  const now = Date.now();
  const diffTime = expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ===== VERIFICATION UTILITIES =====

/**
 * Generate verification URL for health card
 */
export const generateVerificationUrl = (card: HealthCardData): string => {
  if (!card.verificationToken) return '';

  // In production, this would be your domain
  const baseUrl = __DEV__ ? 'http://localhost:3000' : 'https://your-domain.com';
  return `${baseUrl}/verify/${card.verificationToken}`;
};

/**
 * Validate verification token format
 */
export const isValidVerificationToken = (token: string): boolean => {
  // Token should be a UUID or similar format
  const tokenRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return tokenRegex.test(token);
};

// ===== DISPLAY UTILITIES =====

/**
 * Generate card number display format
 */
export const formatCardNumber = (cardNumber?: string): string => {
  if (!cardNumber) return '';

  // Format as XXXX-XXXX-XXXX
  return cardNumber.replace(/(.{4})/g, '$1-').slice(0, -1);
};

/**
 * Get health card title based on job category
 */
export const getCardTitle = (jobCategory?: { name: string }): string => {
  return jobCategory?.name || 'Health Card';
};

// ===== CARD GENERATION UTILITIES =====

/**
 * Generate HTML for health card printing/sharing
 */
export const generateCardHtml = (card: HealthCardData): string => {
  const cardColor = getCardColor(card.jobCategory);
  const status = getCardStatus(card);
  const statusColor = getStatusColor(status);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Health Card - ${card.application?.organization || 'eMediCard'}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
          }
          .card {
            width: 350px;
            height: 220px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
          }
          .card-header {
            background: ${cardColor};
            color: white;
            padding: 15px 20px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .card-title {
            font-size: 16px;
            font-weight: 600;
          }
          .card-status {
            background: ${statusColor};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          .card-body {
            padding: 20px;
            height: 140px;
            display: flex;
            justify-content: space-between;
          }
          .card-info {
            flex: 1;
          }
          .info-row {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            font-weight: 600;
            color: #374151;
          }
          .info-value {
            color: #6B7280;
          }
          .qr-code {
            width: 80px;
            height: 80px;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #9CA3AF;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-header">
            <div class="card-title">${getCardTitle(card.jobCategory)}</div>
            <div class="card-status">${status}</div>
          </div>
          <div class="card-body">
            <div class="card-info">
              <div class="info-row">
                <span class="info-label">Position:</span>
                <span class="info-value">${card.application?.position || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Organization:</span>
                <span class="info-value">${card.application?.organization || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Card Number:</span>
                <span class="info-value">${formatCardNumber(card.cardNumber) || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Issued:</span>
                <span class="info-value">${card.issuedAt ? formatDate(card.issuedAt) : 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expires:</span>
                <span class="info-value">${card.expiresAt ? formatDate(card.expiresAt) : 'N/A'}</span>
              </div>
            </div>
            <div class="qr-code">
              QR Code
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};