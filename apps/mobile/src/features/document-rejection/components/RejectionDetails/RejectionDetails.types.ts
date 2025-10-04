import { EnrichedRejectionHistory } from '@entities/document';

export interface RejectionDetailsProps {
  rejection: EnrichedRejectionHistory;
  onClose?: () => void;
  onResubmit?: () => void;
}
