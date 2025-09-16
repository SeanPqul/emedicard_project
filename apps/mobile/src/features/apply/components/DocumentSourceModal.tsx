import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '../../../styles/components/modals';
import { getColor } from '../../../styles/theme';

interface DocumentSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onPickDocument: () => void;
}

export const DocumentSourceModal: React.FC<DocumentSourceModalProps> = ({
  visible,
  onClose,
  onPickCamera,
  onPickGallery,
  onPickDocument,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <Text style={modalStyles.modalTitle}>Select Document Source</Text>
          
          <TouchableOpacity style={modalStyles.imagePickerOption} onPress={onPickCamera}>
            <Ionicons name="camera" size={24} color={getColor('primary.500')} />
            <Text style={modalStyles.imagePickerOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={modalStyles.imagePickerOption} onPress={onPickGallery}>
            <Ionicons name="images" size={24} color={getColor('primary.500')} />
            <Text style={modalStyles.imagePickerOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={modalStyles.imagePickerOption} onPress={onPickDocument}>
            <Ionicons name="document" size={24} color={getColor('primary.500')} />
            <Text style={modalStyles.imagePickerOptionText}>Select File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={modalStyles.modalCancelButton}
            onPress={onClose}
          >
            <Text style={modalStyles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};