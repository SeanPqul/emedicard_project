import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentSourceModalProps } from './DocumentSourceModal.types';
import { styles } from './DocumentSourceModal.styles';
import { COLORS } from '@/src/shared/constants/theme';

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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Document Source</Text>
          
          <TouchableOpacity style={styles.imagePickerOption} onPress={onPickCamera}>
            <Ionicons name="camera" size={24} color={COLORS.primary.main} />
            <Text style={styles.imagePickerOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imagePickerOption} onPress={onPickGallery}>
            <Ionicons name="images" size={24} color={COLORS.primary.main} />
            <Text style={styles.imagePickerOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imagePickerOption} onPress={onPickDocument}>
            <Ionicons name="document" size={24} color={COLORS.primary.main} />
            <Text style={styles.imagePickerOptionText}>Select File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalCancelButton}
            onPress={onClose}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
