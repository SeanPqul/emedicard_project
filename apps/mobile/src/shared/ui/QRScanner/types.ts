export interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  active?: boolean;
  title?: string;
  subtitle?: string;
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
  accessibilityLabel?: string;
}

export interface ScannerHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
}

export interface ScannerFrameProps {
  scanning: boolean;
  scaleAnim: any; // Animated.Value
  opacityAnim: any; // Animated.Value
  scanLineTranslateY: any; // Animated.AnimatedAddition
  accessibilityLabel: string;
}

export interface ScannerOverlayProps {
  children: React.ReactNode;
}

export interface ScannerControlsProps {
  scanning: boolean;
  onSimulateScan: () => void;
}

export interface StatusIndicatorProps {
  scanning: boolean;
}

export interface ScannerState {
  scanning: boolean;
  setScanning: (scanning: boolean) => void;
}

export interface MockQRData {
  cardId: string;
  type: string;
  status: string;
  expiryDate: string;
  holderName: string;
  issuedDate: string;
  clinic: string;
}
