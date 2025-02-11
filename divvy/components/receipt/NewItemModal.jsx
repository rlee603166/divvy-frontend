import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import theme from '../../theme/index';

const NewItemModal = ({ visible, onClose, onSubmit }) => {
    const [nameInput, setNameInput] = useState('');
    const [priceInput, setPriceInput] = useState('');

    const handlePriceInputChange = text => {
        const cleanText = text.replace('$', '');
        if (cleanText === "" || cleanText === "." || /^\d*\.?\d{0,2}$/.test(cleanText)) {
            setPriceInput('$' + cleanText);
        }
    };

    const handleSubmit = () => {
        const cleanPrice = priceInput.replace('$', '');
        const numericPrice = parseFloat(cleanPrice) || 0;
        
        if (nameInput.trim() && numericPrice >= 0) {
            onSubmit({
                name: nameInput.trim(),
                price: numericPrice,
            });
            // Reset form
            setNameInput('');
            setPriceInput('');
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
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New Item</Text>
                    
                    <TextInput
                        style={styles.modalInput}
                        value={nameInput}
                        onChangeText={setNameInput}
                        placeholder="Item name"
                        placeholderTextColor="#666"
                        selectionColor={theme.colors.primary}
                        autoFocus
                    />
                    
                    <View style={styles.priceInputContainer}>
                        <Text style={styles.dollarSign}>$</Text>
                        <TextInput
                            style={styles.priceInput}
                            value={priceInput.replace('$', '')}
                            onChangeText={handlePriceInputChange}
                            placeholder="0.00"
                            placeholderTextColor="#666"
                            keyboardType="decimal-pad"
                            selectionColor={theme.colors.primary}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.saveButtonText}>Add Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        color: '#1a1a1a',
    },
    modalInput: {
        fontSize: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 16,
        color: '#1a1a1a',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 16,
        paddingLeft: 12,
    },
    dollarSign: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    priceInput: {
        flex: 1,
        fontSize: 16,
        padding: 12,
        color: '#1a1a1a',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
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
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    cancelButtonText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NewItemModal;