import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useStorage() {
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const generateUploadUrl = async () => {
    return generateUploadUrlMutation({});
  };

  return {
    mutations: {
      generateUploadUrl,
    }
  };
}