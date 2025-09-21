export const STEP_TITLES = [
  'Application Type',
  'Job Category', 
  'Personal Details',
  'Upload Documents',
  'Review & Submit'
];

export const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'] as const;

export type ApplicationType = 'New' | 'Renew';
export type CivilStatus = typeof CIVIL_STATUS_OPTIONS[number];