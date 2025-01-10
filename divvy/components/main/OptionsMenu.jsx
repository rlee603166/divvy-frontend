
// src/components/main/OptionsMenu.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { friendTheme } from '../../theme';

const OptionsMenu = ({ visible, onClose, options }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.optionsOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.optionsContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.optionsContent}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  index === 0 && styles.firstOption,
                  index === options.length - 1 && styles.lastOption,
                  option.destructive && styles.destructiveOption
                ]}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
              >
                <Text style={[
                  styles.optionText,
                  option.destructive && styles.destructiveText
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.cancelButton, { marginBottom: 8 }]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    paddingHorizontal: 8,
  },
  optionsContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: friendTheme.colors.gray100,
  },
  firstOption: {
    borderTopWidth: 0,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: friendTheme.colors.gray900,
  },
  destructiveOption: {
    backgroundColor: 'transparent',
  },
  destructiveText: {
    color: friendTheme.colors.error,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: friendTheme.colors.gray900,
  },
});

export default OptionsMenu;