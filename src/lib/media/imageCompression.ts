import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

/**
 * Image Compression Utilities for Mobile Optimization
 * 
 * Compresses receipt images before upload to reduce payload size
 * and improve upload performance on mobile networks.
 */

interface CompressionOptions {
  /**
   * Maximum width in pixels (default: 800)
   */
  maxWidth?: number;
  
  /**
   * Maximum height in pixels (default: 1200)
   */
  maxHeight?: number;
  
  /**
   * JPEG quality (0-1, default: 0.8)
   */
  quality?: number;
  
  /**
   * Output format (default: 'jpeg')
   */
  format?: 'jpeg' | 'png' | 'webp';
  
  /**
   * Whether to auto-rotate based on EXIF data (default: true)
   */
  autoRotate?: boolean;
}

interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

/**
 * Default compression settings optimized for mobile
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 800,
  maxHeight: 1200,
  quality: 0.8,
  format: 'jpeg',
  autoRotate: true,
};

/**
 * Compress an image for mobile upload
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Get original image info
    const originalInfo = await getImageInfo(uri);
    
    // Calculate optimal dimensions
    const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
      originalInfo.width,
      originalInfo.height,
      config.maxWidth!,
      config.maxHeight!
    );
    
    // Prepare manipulation actions
    const actions = [];
    
    // Resize if needed
    if (newWidth !== originalInfo.width || newHeight !== originalInfo.height) {
      actions.push({
        resize: { width: newWidth, height: newHeight }
      });
    }
    
    // Compress and save
    const result = await manipulateAsync(
      uri,
      actions,
      {
        compress: config.quality,
        format: config.format === 'jpeg' ? SaveFormat.JPEG : 
                config.format === 'png' ? SaveFormat.PNG : SaveFormat.WEBP,
        base64: false, // Only generate base64 if explicitly needed for size comparison
      }
    );
    
    // Calculate compression stats
    const compressedInfo = await getImageInfo(result.uri);
    const compressionRatio = originalInfo.size && compressedInfo.size 
      ? (1 - compressedInfo.size / originalInfo.size) * 100
      : undefined;
    
    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      originalSize: originalInfo.size,
      compressedSize: compressedInfo.size,
      compressionRatio,
    };
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

/**
 * Compress multiple images in parallel (for bulk operations)
 */
export async function compressImages(
  uris: string[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const compressionPromises = uris.map(uri => compressImage(uri, options));
  return Promise.all(compressionPromises);
}

/**
 * Smart compression based on network conditions
 */
export async function compressImageForNetwork(
  uri: string,
  isWifi: boolean,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // More aggressive compression on cellular
  const networkOptions: CompressionOptions = isWifi 
    ? {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.85,
        ...options
      }
    : {
        maxWidth: 600,
        maxHeight: 800,
        quality: 0.7,
        ...options
      };
  
  return compressImage(uri, networkOptions);
}

/**
 * Compress receipt images specifically (optimized for document readability)
 */
export async function compressReceiptImage(
  uri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // Receipt-specific settings prioritize readability
  const receiptOptions: CompressionOptions = {
    maxWidth: 1000,
    maxHeight: 1400,
    quality: 0.85, // Higher quality for text readability
    format: 'jpeg',
    ...options
  };
  
  return compressImage(uri, receiptOptions);
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too large
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Get image file information (including file size if possible)
 */
async function getImageInfo(uri: string): Promise<{
  width: number;
  height: number;
  size?: number;
}> {
  try {
    // For local files, we can get basic info
    const result = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
    
    // Try to get file size (this is a rough approximation)
    let size: number | undefined;
    try {
      // This is a basic estimation - in a real app you might use expo-file-system
      const response = await fetch(uri);
      const blob = await response.blob();
      size = blob.size;
    } catch {
      // File size unavailable
    }
    
    return {
      width: result.width,
      height: result.height,
      size,
    };
  } catch (error) {
    throw new Error(`Failed to get image info: ${error.message}`);
  }
}

/**
 * Utility to check if compression is recommended
 */
export function shouldCompressImage(
  width: number,
  height: number,
  fileSize?: number
): boolean {
  const maxDimension = Math.max(width, height);
  const minCompressionSize = 100 * 1024; // 100KB
  
  return (
    maxDimension > 1000 || // Large dimensions
    (fileSize && fileSize > minCompressionSize) // Large file size
  );
}

/**
 * Compression presets for different use cases
 */
export const CompressionPresets = {
  // High quality for important documents
  DOCUMENT_HIGH: {
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 0.9,
    format: 'jpeg' as const,
  },
  
  // Balanced quality for general receipts
  RECEIPT_STANDARD: {
    maxWidth: 800,
    maxHeight: 1200,
    quality: 0.8,
    format: 'jpeg' as const,
  },
  
  // Aggressive compression for cellular networks
  CELLULAR_OPTIMIZED: {
    maxWidth: 600,
    maxHeight: 800,
    quality: 0.7,
    format: 'jpeg' as const,
  },
  
  // Minimal compression for Wi-Fi
  WIFI_QUALITY: {
    maxWidth: 1400,
    maxHeight: 1800,
    quality: 0.85,
    format: 'jpeg' as const,
  },
} as const;

/**
 * Hook for image compression with network awareness
 */
export function useImageCompression() {
  const compressForUpload = async (
    uri: string,
    isWifi: boolean = true,
    useCase: 'receipt' | 'document' | 'general' = 'general'
  ): Promise<CompressionResult> => {
    let preset: CompressionOptions;
    
    switch (useCase) {
      case 'receipt':
        preset = isWifi ? CompressionPresets.RECEIPT_STANDARD : CompressionPresets.CELLULAR_OPTIMIZED;
        break;
      case 'document':
        preset = isWifi ? CompressionPresets.DOCUMENT_HIGH : CompressionPresets.RECEIPT_STANDARD;
        break;
      default:
        preset = isWifi ? CompressionPresets.WIFI_QUALITY : CompressionPresets.CELLULAR_OPTIMIZED;
    }
    
    return compressImage(uri, preset);
  };
  
  return {
    compressForUpload,
    presets: CompressionPresets,
  };
}
