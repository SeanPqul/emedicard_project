export interface Document {
  type: 'id_front' | 'id_back' | 'photo_with_id' | 'cedula' | 'proof_of_residency';
  uri?: string;
  name?: string;
}

export interface UploadDocumentsStepProps {
  documents: Document[];
  onDocumentSelect: (type: Document['type'], uri: string, name: string) => void;
  onDocumentRemove: (type: Document['type']) => void;
  onSelectDocument: (type: Document['type']) => void;
}
