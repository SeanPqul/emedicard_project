export interface DocumentSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onPickDocument: () => void;
}
