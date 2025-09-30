import { useUser } from '@clerk/clerk-expo';
import { useUsers } from '@/src/features/profile/hooks/useUsers';
import { getUserDisplayName } from '@/src/shared/utils/user-utils';

export function useProfile() {
  const { user } = useUser();
  const { data, isLoading } = useUsers();
  const userProfile = data?.currentUser ?? null;

  const displayName = getUserDisplayName(user, userProfile);
  const email = user?.primaryEmailAddress?.emailAddress || userProfile?.email;
  const memberSince = new Date(user?.createdAt || Date.now()).getFullYear();
  const imageUrl = user?.imageUrl || userProfile?.image || null;

  return {
    isLoading,
    user: {
      displayName,
      email,
      memberSince,
      imageUrl,
    },
  };
}
