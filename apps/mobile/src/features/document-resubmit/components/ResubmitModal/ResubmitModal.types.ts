import { Id } from '@backend/convex/_generated/dataModel';

export interface ResubmitModalProps {
  visible: boolean;
  onClose: () => void;
  applicationId: Id<"applications">;
  documentTypeId: Id<"documentTypes">;
  fieldIdentifier: string;
  documentName: string;
  onSuccess?: () => void;
}
