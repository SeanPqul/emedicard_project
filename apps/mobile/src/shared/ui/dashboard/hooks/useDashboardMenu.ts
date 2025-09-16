import { useState } from 'react';
import { router } from 'expo-router';

interface SecondaryAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export const SECONDARY_ACTIONS: SecondaryAction[] = [
  {
    id: 'requirements',
    label: 'View Requirements',
    icon: 'document-text-outline',
    route: '/(screens)/(shared)/document-requirements',
    accessibilityLabel: 'View Requirements',
    accessibilityHint: 'View document requirements for health card applications',
  },
  {
    id: 'health-cards',
    label: 'My Health Cards',
    icon: 'card-outline',
    route: '/(screens)/(shared)/health-cards',
    accessibilityLabel: 'My Health Cards',
    accessibilityHint: 'View all your health cards',
  },
  {
    id: 'activity',
    label: 'Activity History',
    icon: 'time-outline',
    route: '/(screens)/(shared)/activity',
    accessibilityLabel: 'Activity History',
    accessibilityHint: 'View your activity history',
  },
  {
    id: 'qr-scanner',
    label: 'Scan QR Code',
    icon: 'scan-outline',
    route: '/(screens)/(shared)/qr-scanner',
    accessibilityLabel: 'Scan QR Code',
    accessibilityHint: 'Scan a QR code',
  },
];

export function useDashboardMenu() {
  const [showMenu, setShowMenu] = useState(false);

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  const handleSecondaryAction = (action: SecondaryAction) => {
    closeMenu();
    router.push(action.route as any);
  };

  return {
    showMenu,
    openMenu,
    closeMenu,
    handleSecondaryAction,
    secondaryActions: SECONDARY_ACTIONS,
  };
}

export type { SecondaryAction };
