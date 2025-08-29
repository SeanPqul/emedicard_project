export interface ActivityFilter {
  id: string;
  label: string;
}

export const ACTIVITY_FILTERS: ActivityFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'application', label: 'Applications' },
  { id: 'payment', label: 'Payments' },
  { id: 'card_issued', label: 'Cards' },
];