import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

export function useDocumentTypes() {
  const documentTypes = useQuery(api.documentTypes.list.list);
  
  return {
    documentTypes: documentTypes || [],
    isLoading: documentTypes === undefined,
  };
}
