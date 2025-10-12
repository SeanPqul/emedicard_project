import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

export type DeepLinkType = 
  | 'application' 
  | 'health-card' 
  | 'orientation' 
  | 'payment' 
  | 'upload-documents'
  | 'notification';

export interface DeepLinkData {
  type: DeepLinkType;
  id?: string;
  formId?: string;
  params?: Record<string, string>;
}

export const useDeepLink = () => {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const parsed = Linking.parse(url);
      const { hostname, path, queryParams } = parsed;
      
      // Handle different deep link patterns
      if (hostname === 'notification' || path?.startsWith('/notification/')) {
        handleNotificationDeepLink(queryParams ?? {});
      } else if (hostname === 'application' || path?.startsWith('/(screens)/(shared)/(screens)/(shared)/application/')) {
        handleApplicationDeepLink(queryParams ?? {});
      } else if (hostname === 'health-card' || path?.startsWith('/health-card/')) {
        handleHealthCardDeepLink(queryParams ?? {});
      } else if (hostname === 'orientation' || path?.startsWith('/orientation/')) {
        handleOrientationDeepLink(queryParams ?? {});
      } else if (hostname === 'payment' || path?.startsWith('/payment/')) {
        handlePaymentDeepLink(queryParams ?? {});
      } else if (
        hostname === 'upload' ||
        hostname === 'upload-documents' ||
        path?.startsWith('/upload') ||
        path?.startsWith('/upload-documents')
      ) {
        handleUploadDeepLink(queryParams ?? {});
      }
    };

    // Handle initial app launch with deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links when app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleNotificationDeepLink = (params: Record<string, any>) => {
    const { type, id, formId } = params;
    
    switch (type) {
      case 'MissingDoc':
        if (formId) {
          router.push({
            pathname: '/(screens)/(shared)/documents/upload',
            params: { formId }
          });
        }
        break;
      case 'PaymentReceived':
        if (formId) {
          router.push({
            pathname: '/(screens)/(shared)/payment',
            params: { formId }
          });
        }
        break;
      case 'OrientationScheduled':
        if (formId) {
          router.push({
            pathname: '/(screens)/(shared)/orientation',
            params: { formId }
          });
        }
        break;
      case 'CardIssue':
        router.push('/(screens)/(shared)/health-cards');
        break;
      case 'FormApproved':
        if (formId) {
          router.push({
            pathname: '/(tabs)/application',
            params: { highlightId: formId }
          });
        }
        break;
      default:
        router.push('/(tabs)/notification');
    }
  };

  const handleApplicationDeepLink = (params: Record<string, any>) => {
    const { id } = params;
    if (id) {
      router.push({
        pathname: '/(tabs)/application',
        params: { highlightId: id }
      });
    } else {
      router.push('/(tabs)/application');
    }
  };

  const handleHealthCardDeepLink = (params: Record<string, any>) => {
    const { id } = params;
    if (id) {
      router.push({
        pathname: '/(screens)/(shared)/health-cards',
        params: { cardId: id }
      });
    } else {
      router.push('/(screens)/(shared)/health-cards');
    }
  };

  const handleOrientationDeepLink = (params: Record<string, any>) => {
    const { formId } = params;
    if (formId) {
      router.push({
        pathname: '/(screens)/(shared)/orientation',
        params: { formId }
      });
    } else {
      router.push('/(screens)/(shared)/orientation');
    }
  };

  const handlePaymentDeepLink = (params: Record<string, any>) => {
    const { formId } = params;
    if (formId) {
      router.push(`/(screens)/(application)/${formId}?section=payment`);
    } else {
      router.push('/(tabs)/notification');
    }
  };

  const handleUploadDeepLink = (params: Record<string, any>) => {
    const { formId } = params;
    if (formId) {
      router.push({
        pathname: '/(screens)/(shared)/documents/view-document',
        params: { formId }
      });
    } else {
      router.push('/(tabs)/apply');
    }
  };

  // Helper function to generate deep link URLs
  const generateDeepLink = (type: DeepLinkType, params?: Record<string, string>): string => {
    const baseUrl = 'emedicardproject://';
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return `${baseUrl}${type}${queryString}`;
  };

  return {
    generateDeepLink,
    handleNotificationDeepLink,
    handleApplicationDeepLink,
    handleHealthCardDeepLink,
    handleOrientationDeepLink,
    handlePaymentDeepLink,
    handleUploadDeepLink
  };
};