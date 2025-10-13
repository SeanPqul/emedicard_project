import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function LegacyPaymentRedirect() {
  const params = useLocalSearchParams<{ formId?: string }>();

  useEffect(() => {
    if (params?.formId) {
      router.replace(`/(screens)/(application)/${params.formId}?section=payment`);
    } else {
      router.replace('/(tabs)/notification');
    }
  }, [params?.formId]);

  return null;
}
