// Scanner feature types

export interface QRCodeData {
  type: 'health_card' | 'application' | 'verification';
  id: string;
  timestamp: number;
  signature?: string;
  metadata?: {
    healthCardId?: string;
    applicationId?: string;
    userId?: string;
    expirationDate?: string;
  };
}

export interface ScanResult {
  success: boolean;
  data?: QRCodeData;
  error?: string;
  scannedAt: number;
}

export interface VerificationResult {
  isValid: boolean;
  healthCard?: {
    id: string;
    holderName: string;
    status: 'Active' | 'Expired' | 'Suspended';
    expirationDate: string;
    category: string;
  };
  message: string;
  verifiedAt: number;
}

export interface ScannerConfig {
  enableFlash: boolean;
  enableAutoFocus: boolean;
  scanDelay: number; // ms between scans
  vibrationEnabled: boolean;
}
