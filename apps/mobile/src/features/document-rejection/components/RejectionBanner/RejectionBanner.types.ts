import { EnrichedRejectionHistory } from '@entities/document';

export interface RejectionBannerProps {
  rejection: EnrichedRejectionHistory;
  onViewDetails: () => void;
  onResubmit: () => void;
  showActions?: boolean;
}
