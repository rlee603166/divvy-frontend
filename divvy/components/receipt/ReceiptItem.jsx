import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Modal,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../theme/index";

const ReceiptItemView = ({
    group,
    item,
    onUpdateItem,
    onDeleteItem,
    disabled,
    setDisabled,
    isEditMode,
    selectedUser
}) => {
    const [priceInput, setPriceInput] = useState(item.price.toString());
    const [nameInput, setNameInput] = useState(item.name);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (disabled || isEditMode) {
            setIsEditing(false);
            setDisabled(false);
        }
    }, [disabled]);

    useEffect(() => {
        setPriceInput(item.price.toFixed(2));
        setNameInput(item.name);
    }, [item.price, item.name]);

    const getNumericPrice = price => {
        const cleanPrice = typeof price === "string" ? price.replace('$', '') : price;
        const numPrice = typeof cleanPrice === "string" ? parseFloat(cleanPrice) : cleanPrice;
        return isNaN(numPrice) ? 0 : Number(numPrice.toFixed(2));
    };

    const handlePriceInputChange = text => {
        const cleanText = text.replace('$', '');
        if (cleanText === "" || cleanText === "." || /^\d*\.?\d{0,2}$/.test(cleanText)) {
            setPriceInput('$' + cleanText);
        }
    };

    const handleSubmit = () => {
        let numericPrice = getNumericPrice(priceInput);
        if (nameInput.trim() && numericPrice >= 0) {
            onUpdateItem(item.id, {
                ...item,
                name: nameInput.trim(),
                price: numericPrice,
            });
            setIsEditing(false);
        }
    };

    
    const handleDelete = () => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => {
                        // Close the editing modal first
                        setIsEditing(false);
                        
                        // Use requestAnimationFrame to ensure the modal is closed
                        // before triggering the delete
                        requestAnimationFrame(() => {
                            if (onDeleteItem) {
                                onDeleteItem(item.id);
                            }
                        });
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    const toggleItemAssignment = () => {
        if (!selectedUser || isEditMode || isEditing) return;
        
        let newPeople;
        if (selectedUser === 'everyone') {
            const allMemberIds = group.members.map(member => member.id);
            const isEveryoneAssigned = allMemberIds.every(id => 
                item.people?.includes(id)
            );
            newPeople = isEveryoneAssigned ? [] : allMemberIds;
        } else {
            const currentPeople = new Set(item.people || []);
            if (currentPeople.has(selectedUser)) {
                currentPeople.delete(selectedUser);
            } else {
                currentPeople.add(selectedUser);
            }
            newPeople = Array.from(currentPeople);
        }
        
        onUpdateItem(item.id, {
            ...item,
            people: newPeople
        });
    };

    const renderAssignedUsers = () => {
        if (!item?.people?.length) return null;
        
        const assignedPeople = new Set(item.people);
        if (assignedPeople.size === group.members.length) {
            return <Text style={styles.assignmentText}>Everyone is splitting</Text>;
        }

        const assignedUsers = group.members
            .filter(member => assignedPeople.has(member.id))
            .map(member => {
                if (!member || typeof member.name !== 'string') {
                    return 'User';
                }
                const nameParts = member.name.split(' ');
                return nameParts[0] || 'User';
            })
            .filter(Boolean);

        return assignedUsers.length > 0 ? 
            <Text style={styles.assignmentText}>{assignedUsers.join(', ')}</Text> : 
            null;
    };

    const isItemHighlighted = () => {
        if (!selectedUser) return false;
        if (selectedUser === 'everyone') {
            return item.people?.length === group.members.length;
        }
        return item.people?.includes(selectedUser);
    };

    return (
        <View style={styles.outerContainer}>
            <TouchableOpacity 
                onPress={toggleItemAssignment}
                activeOpacity={0.9}
                disabled={isEditing}
            >
                <View style={[
                    styles.container,
                    isItemHighlighted() && styles.containerHighlighted
                ]}>
                    <View style={styles.header}>
                        <View style={styles.itemInfo}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.itemName}>{item.name}</Text>
                            </View>
                            <View style={styles.peopleCount}>
                                <Ionicons name="people" size={16} color="#666" />
                                <Text style={styles.peopleCountText}>
                                    {item.people?.length || 0} people
                                </Text>
                            </View>
                            {renderAssignedUsers()}
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                            <TouchableOpacity 
                                onPress={() => !isEditMode && setIsEditing(true)}
                                style={styles.editButton}
                            >
                                <Ionicons name="create-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <Modal
                visible={isEditing}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditing(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Item</Text>
                        
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
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={handleDelete}
                        >
                            <Text style={styles.deleteButtonText}>Delete Item</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        marginHorizontal: 2,
        marginVertical: 4,
    },
    container: {
        backgroundColor: "white",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    containerHighlighted: {
        backgroundColor: '#F5F8FF',
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    itemInfo: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#000',
    },
    peopleCount: {
        flexDirection: "row",
        alignItems: "center",
    },
    peopleCountText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 4,
    },
    assignmentText: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#000',
    },
    editButton: {
        padding: 6,
    },
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
    deleteButton: {
        padding: 14,
        backgroundColor: 'friendTheme.colors.gray100',
        borderRadius: 10,
    },
    deleteButtonText: {
        color: '#EF4444',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReceiptItemView;
