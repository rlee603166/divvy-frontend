
// src/components/EditNameModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { friendTheme } from '../../theme';

const EditNameModal = ({ visible, onClose, onSave, initialValue }) => {
  const [name, setName] = useState(initialValue);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Group Name</Text>
          
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoFocus
            selectionColor={friendTheme.colors.primary}
            placeholder="Enter group name"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: friendTheme.colors.gray50,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: friendTheme.colors.primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
  },
  cancelButtonText: {
    color: friendTheme.colors.gray600,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default EditNameModal;