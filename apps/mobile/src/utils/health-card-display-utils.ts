/**
 * Health Card Display Utilities
 * Functions for displaying, formatting, and managing health card data
 */

export interface HealthCardData {
  _id: string;
  formId: string;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  form?: any;
  jobCategory?: any;
}

/**
 * Determines the color scheme for a health card based on job category
 */
export const getCardColor = (jobCategory: any): string => {
  if (jobCategory?.colorCode) {
    return jobCategory.colorCode;
  }
  // Fallback colors
  if (jobCategory?.name.toLowerCase().includes('food')) {
    return '#FFD700';
  } else if (jobCategory?.name.toLowerCase().includes('security')) {
    return '#4169E1';
  }
  return '#6B46C1';
};

/**
 * Determines the status of a health card based on expiry date
 */
export const getCardStatus = (card: HealthCardData): 'active' | 'expired' => {
  const now = Date.now();
  if (card.expiresAt < now) {
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
export const generateVerificationUrl = (card: HealthCardData): string => {
  return `https://yourdomain.com/verify/${card.verificationToken}`;
};

/**
 * Formats a timestamp into a readable date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Generates HTML content for printable health card
 */
export const generateCardHtml = (card: HealthCardData): string => {
  const status = getCardStatus(card);
  const verificationUrl = generateVerificationUrl(card);
  
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
            background: linear-gradient(135deg, ${getCardColor(card.jobCategory)}, ${getCardColor(card.jobCategory)}dd);
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
          <div class="card-header">${card.jobCategory?.name || 'Health Card'}</div>
          <div class="card-id">ID: ${card.verificationToken}</div>
          <div class="card-dates">Issued: ${formatDate(card.issuedAt)}</div>
          <div class="card-dates">Expires: ${formatDate(card.expiresAt)}</div>
          <div class="verification-url">Verify: ${verificationUrl}</div>
        </div>
      </body>
    </html>
  `;
};