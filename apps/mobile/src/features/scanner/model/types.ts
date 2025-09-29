// Scanner feature types - Re-exports from entity (FSD pattern)
import type {
  QRCodeData,
  ScanResult,
  VerificationResult
} from '@entities/scanner';

// Re-export entity types
export type {
  QRCodeData,
  ScanResult,
  VerificationResult
};

// Feature-specific types (UI configuration)
export interface ScannerConfig {
  enableFlash: boolean;
  enableAutoFocus: boolean;
  scanDelay: number; // ms between scans
  vibrationEnabled: boolean;
}
