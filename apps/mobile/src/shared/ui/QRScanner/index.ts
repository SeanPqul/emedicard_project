export { QRCodeScanner } from './QRCodeScanner';
export { ScannerHeader } from './ScannerHeader';
export { ScannerFrame } from './ScannerFrame';
export { ScannerOverlay } from './ScannerOverlay';
export { ScannerControls } from './ScannerControls';
export { StatusIndicator } from './StatusIndicator';

// Export types for consumers
export type {
  QRScannerProps,
  ScannerHeaderProps,
  ScannerFrameProps,
  ScannerOverlayProps,
  ScannerControlsProps,
  StatusIndicatorProps,
  ScannerState,
  MockQRData,
} from './types';

// Export hooks for advanced usage
export {
  useScanLineAnimation,
  useScanFeedbackAnimation,
  useScannerState,
  useFlashState,
} from './hooks';
