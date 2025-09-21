export interface ApplicationTypeStepProps {
  value: 'New' | 'Renew' | null;
  onChange: (value: 'New' | 'Renew') => void;
}

export type ApplicationType = 'New' | 'Renew';
