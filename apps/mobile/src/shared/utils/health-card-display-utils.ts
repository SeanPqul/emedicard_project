import { theme } from '@shared/styles/theme';
import { Id } from 'backend/convex/_generated/dataModel';

export interface HealthCardData {
  id: string;
  holderName: string;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  verificationToken?: string;
  cardType: string;
  jobCategory?: string;
  metadata?: Record<string, any>;
}

// Backend health card structure
export interface BackendHealthCard {
  _id: Id<"healthCards">;
  _creationTime: number;
  applicationId: Id<"applications">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  application?: any;
  jobCategory?: {
    _id: Id<"jobCategories">;
    name: string;
    colorCode: string;
    requireOrientation?: string | boolean;
  } | null;
}

/**
 * Get the appropriate color for a health card based on its type
 */
export function getCardColor(jobCategory?: { name: string; colorCode: string } | null): string {
  if (jobCategory?.colorCode) {
    return jobCategory.colorCode;
  }
  
  const colorMap: Record<string, string> = {
    basic: theme.colors.accent.medicalBlue,
    standard: theme.colors.accent.medicalBlue,
    premium: theme.colors.brand.primary,
    gold: '#FFD700',
    platinum: '#E5E4E2',
    family: theme.colors.brand.secondary,
    senior: theme.colors.blue[500],
    corporate: theme.colors.neutral[700],
    student: theme.colors.purple[500],
  };

  const cardType = jobCategory?.name?.toLowerCase() || 'basic';
  return colorMap[cardType] || theme.colors.accent.medicalBlue;
}

/**
 * Get the health card status display
 */
export function getCardStatus(card: BackendHealthCard | { expiresAt?: number }): string {
  // Check if card has expiresAt property
  if ('expiresAt' in card && card.expiresAt) {
    const now = Date.now();
    return card.expiresAt > now ? 'active' : 'expired';
  }
  
  return 'pending';
}

/**
 * Get the status color for badges and indicators
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: theme.colors.status.success,
    expired: theme.colors.status.error,
    suspended: theme.colors.status.warning,
    pending: theme.colors.gray[400],
  };
  
  return statusColors[status.toLowerCase()] || theme.colors.gray[400];
}

/**
 * Generate a verification URL for a health card
 */
export function generateVerificationUrl(card: BackendHealthCard | { verificationToken: string }, baseUrl?: string): string {
  const base = baseUrl || 'https://emedicard.com/verify';
  return `${base}?token=${card.verificationToken}`;
}

/**
 * Format date for display on health cards
 */
export function formatDate(date: string | Date | number, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generate HTML for health card display (for printing/export)
 */
export function generateCardHtml(card: BackendHealthCard): string {
  const status = getCardStatus(card);
  const cardColor = getCardColor(card.jobCategory);
  const statusColor = getStatusColor(status);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .card {
          width: 350px;
          height: 220px;
          background: linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%);
          border-radius: 12px;
          padding: 20px;
          color: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          transform: rotate(-30deg);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        .card-title {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .status-badge {
          background-color: ${statusColor};
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .card-number {
          font-size: 20px;
          letter-spacing: 2px;
          margin-bottom: 20px;
          font-family: monospace;
          position: relative;
          z-index: 1;
        }
        .card-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          position: relative;
          z-index: 1;
        }
        .info-block {
          margin-bottom: 10px;
        }
        .info-label {
          font-size: 10px;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
        }
        .verification {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 10px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="card-header">
          <div class="card-title">${card.jobCategory?.name || 'Health'} Card</div>
          <div class="status-badge">${status.toUpperCase()}</div>
        </div>
        <div class="card-number">${card.verificationToken.slice(0, 16).toUpperCase()}</div>
        <div class="card-info">
          <div class="info-block">
            <div class="info-label">Card ID</div>
            <div class="info-value">${card._id}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Valid Until</div>
            <div class="info-value">${formatDate(new Date(card.expiresAt))}</div>
          </div>
        </div>
        ${card.verificationToken ? `
          <div class="verification">
            Verify at: emedicard.com/verify
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

/**
 * Format card number with spaces for display
 */
function formatCardNumber(cardNumber: string): string {
  // Format as XXXX XXXX XXXX XXXX
  const cleaned = cardNumber.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

/**
 * Check if a health card is expired
 */
export function isCardExpired(expiryDate: string | Date): boolean {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return expiry < new Date();
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string | Date): number {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get expiry warning message
 */
export function getExpiryWarning(expiryDate: string | Date): string | null {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  if (daysUntilExpiry < 0) {
    return 'This card has expired';
  } else if (daysUntilExpiry <= 7) {
    return `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  } else if (daysUntilExpiry <= 30) {
    return 'Expires soon';
  }
  
  return null;
}
