/**
 * Health Card Display Utilities
 * Functions for displaying, formatting, and managing health card data
 */

import { Doc, Id } from '@backend/convex/_generated/dataModel';

// Re-export the backend health card type for consistency
export type BackendHealthCard = Doc<'healthCards'>;

export interface HealthCardData {
  _id: string;
  applicationId?: string; // Changed from formId to applicationId, optional for backward compatibility
  cardUrl: string;
  issuedAt?: number; // Make optional for better type safety
  expiresAt?: number; // Make optional for better type safety  
  verificationToken?: string; // Make optional for better type safety
  application?: any; // Changed from form to application
  jobCategory?: any;
}

/**
 * Determines the color scheme for a health card based on job category
 */
export const getCardColor = (jobCategory: any): string => {
  if (jobCategory?.colorCode) {
    return jobCategory.colorCode;
  }
  // Fallback colors - must match theme.colors.jobCategories
  if (jobCategory?.name.toLowerCase().includes('food')) {
    return '#FFD700'; // theme.colors.jobCategories.foodHandler
  } else if (jobCategory?.name.toLowerCase().includes('security')) {
    return '#4169E1'; // theme.colors.jobCategories.securityGuard
  } else if (jobCategory?.name.toLowerCase().includes('pink') || 
             jobCategory?.name.toLowerCase().includes('skin')) {
    return '#FF69B4'; // theme.colors.jobCategories.pink
  }
  return '#6B46C1'; // theme.colors.jobCategories.others
};

/**
 * Determines the status of a health card based on expiry date
 * Uses server-computed expiry when available (tamper-proof)
 */
export const getCardStatus = (card: HealthCardData | BackendHealthCard): 'active' | 'expired' | 'revoked' => {
  // Check if card is revoked (manual admin action)
  if ('status' in card && card.status === 'revoked') {
    return 'revoked';
  }
  
  // Prefer server-computed expiry status (tamper-proof)
  if ('isExpired' in card && typeof (card as any).isExpired === 'boolean') {
    return (card as any).isExpired ? 'expired' : 'active';
  }
  
  // Fallback: Client-side validation (for backwards compatibility)
  const now = Date.now();
  const expiryDate = 'expiryDate' in card ? card.expiryDate : (card as any).expiresAt;
  
  if (!expiryDate) {
    // If no expiry date, use status field
    return ('status' in card && card.status) ? card.status as 'active' | 'expired' | 'revoked' : 'active';
  }
  
  // Card is expired if current time is past expiry date
  if (expiryDate < now) {
    return 'expired';
  }
  
  return 'active';
};

/**
 * Gets the color associated with a card status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#28A745';
    case 'expired':
      return '#DC3545';
    case 'pending':
      return '#FFC107';
    default:
      return '#6C757D';
  }
};

/**
 * Generates a verification URL for a health card
 */
export const generateVerificationUrl = (card: HealthCardData | BackendHealthCard): string => {
  // New schema uses registrationNumber, old schema uses verificationToken
  const token = 'registrationNumber' in card ? card.registrationNumber : (card as any).verificationToken;
  const baseUrl = process.env.EXPO_PUBLIC_VERIFICATION_URL || 'https://emedicard-project.vercel.app';
  return `${baseUrl}/verify/${token}`;
};

/**
 * Formats a timestamp into a readable date string
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp) {
    return 'N/A';
  }
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Generates HTML content for printable health card
 * For new schema cards, return the stored htmlContent directly
 * For old schema cards, generate simple HTML on the fly
 */
export const generateCardHtml = (card: HealthCardData | BackendHealthCard & { jobCategory?: any }): string => {
  // New schema: use stored htmlContent with proper page size
  if ('htmlContent' in card && card.htmlContent) {
    // Wrap the HTML content with proper page size settings for PDF generation
    // Override the page size to match exact fold-container dimensions (640px x 448px)
    const wrappedHtml = card.htmlContent.replace(
      '@page {',
      `@page {
        /* Match exact fold-container dimensions: 640px width x 448px height */`
    ).replace(
      'size: 280mm 90mm;',
      'size: 640px 448px;'
    ).replace(
      '</style>',
      `
      /* Critical: Force everything on ONE page at exact dimensions */
      * {
        page-break-inside: avoid !important;
        page-break-before: avoid !important;
        page-break-after: avoid !important;
        break-inside: avoid !important;
      }
      
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 640px !important;
        height: 448px !important;
        overflow: hidden !important;
        background: #e8e8e8;
      }
      
      body {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
      }
      
      .fold-container {
        page-break-inside: avoid !important;
        box-shadow: none !important;
        display: flex !important;
        width: 640px !important;
        height: 448px !important;
      }
      
      .health-card, .card-back {
        page-break-inside: avoid !important;
        flex-shrink: 0 !important;
      }
      
      @media print {
        body { padding: 0 !important; background: #e8e8e8; }
        .fold-container { box-shadow: none !important; }
      }
    </style>`
    );
    return wrappedHtml;
  }
  
  // Fallback for old schema: generate simple HTML
  const status = getCardStatus(card);
  const verificationUrl = generateVerificationUrl(card);
  const jobCategory = 'jobCategory' in card ? card.jobCategory : undefined;
  const issuedDate = 'issuedDate' in card ? card.issuedDate : (card as any).issuedAt;
  const expiryDate = 'expiryDate' in card ? card.expiryDate : (card as any).expiresAt;
  const token = 'registrationNumber' in card ? card.registrationNumber : (card as any).verificationToken;
  
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .card { 
            width: 300px; 
            height: 200px; 
            border: 2px solid #333; 
            border-radius: 10px; 
            padding: 20px; 
            margin: 0 auto;
            background: linear-gradient(135deg, ${getCardColor(jobCategory)}, ${getCardColor(jobCategory)}dd);
            color: white;
            position: relative;
          }
          .card-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .card-id { font-size: 14px; margin-bottom: 5px; }
          .card-dates { font-size: 12px; margin-bottom: 5px; }
          .qr-code { position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; }
          .status { 
            position: absolute; 
            top: 10px; 
            right: 10px; 
            background: ${getStatusColor(status)}; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 10px;
          }
          .verification-url { font-size: 10px; position: absolute; bottom: 10px; left: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status">${status.toUpperCase()}</div>
          <div class="card-header">${jobCategory?.name || 'Health Card'}</div>
          <div class="card-id">ID: ${token}</div>
          <div class="card-dates">Issued: ${formatDate(issuedDate)}</div>
          <div class="card-dates">Expires: ${formatDate(expiryDate)}</div>
          <div class="verification-url">Verify: ${verificationUrl}</div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Gets a display-friendly name for the health card type
 */
export const getHealthCardTypeName = (categoryName: string): string => {
  if (!categoryName) return 'Standard Health Card';
  
  const lowerCaseName = categoryName.toLowerCase();
  
  // Map job category names to health card types
  // Check more specific matches first to avoid conflicts
  if (lowerCaseName.includes('non-food') || lowerCaseName.includes('nonfood')) {
    return 'Non-Food Handler\'s Card';
  }
  
  if (lowerCaseName.includes('skin-to-skin') || lowerCaseName.includes('skin to skin')) {
    return 'Skin-to-Skin Contact Worker Health Card';
  }
  
  if (lowerCaseName.includes('food handler') || lowerCaseName.includes('food')) {
    return 'Food Handler\'s Card';
  }
  
  if (lowerCaseName.includes('security')) {
    return 'Security Guard Card';
  }
  
  if (lowerCaseName.includes('driver')) {
    return 'Professional Driver\'s Card';
  }
  
  if (lowerCaseName.includes('healthcare') || lowerCaseName.includes('health care')) {
    return 'Healthcare Worker Card';
  }
  
  if (lowerCaseName.includes('general')) {
    return 'General Health Card';
  }
  
  if (lowerCaseName.includes('standard')) {
    return 'Standard Health Card';
  }
  
  // Default to using the category name
  return `${categoryName} Health Card`;
};

/**
 * Gets payment methods available for a job category
 */
export const getPaymentMethods = (jobCategory: string): Array<{ method: string; description: string }> => {
  // Default payment methods available for all categories
  return [
    {
      method: 'Maya',
      description: 'Pay online using Maya (PayMaya) - instant and secure payment'
    },
    {
      method: 'Barangay Hall',
      description: 'Pay at Barangay Hall in Davao City'
    },
    {
      method: 'Sanggunian Hall',
      description: 'Pay at the Sanggunian Hall cashier - business hours only'
    }
  ];
};
