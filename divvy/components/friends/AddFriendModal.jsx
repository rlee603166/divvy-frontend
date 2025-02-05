// components/friends/AddFriendModal.js
import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { friendTheme } from "../../theme";

export function AddFriendModal({
    visible,
    onClose,
    onAdd,
    newFriendName,
    setNewFriendName,
    newFriendUsername,
    setNewFriendUsername,
}) {
    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New Friend</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={newFriendName}
                        onChangeText={setNewFriendName}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username (e.g. @username)"
                        value={newFriendUsername}
                        onChangeText={setNewFriendUsername}
                        autoCapitalize="none"
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.addButton]}
                            onPress={onAdd}
                        >
                            <Text style={styles.addButtonText}>Add Friend</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: friendTheme.spacing[4],
    },
    modalContent: {
        backgroundColor: friendTheme.colors.white,
        borderRadius: 16,
        padding: friendTheme.spacing[4],
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
        marginBottom: friendTheme.spacing[4],
        textAlign: "center",
        textTransform: "none",
    },
    input: {
        borderWidth: 1,
        borderColor: friendTheme.colors.gray200,
        borderRadius: 8,
        padding: friendTheme.spacing[3],
        marginBottom: friendTheme.spacing[3],
        fontSize: 16,
        color: friendTheme.colors.gray900,
        backgroundColor: friendTheme.colors.white,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: friendTheme.spacing[3],
        marginTop: friendTheme.spacing[2],
    },
    modalButton: {
        flex: 1,
        padding: friendTheme.spacing[3],
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: friendTheme.colors.gray100,
    },
    addButton: {
        backgroundColor: friendTheme.colors.primary,
    },
    cancelButtonText: {
        color: friendTheme.colors.gray600,
        fontSize: 16,
        fontWeight: "500",
        textTransform: "none",
    },
    addButtonText: {
        color: friendTheme.colors.white,
        fontSize: 16,
        fontWeight: "500",
        textTransform: "none",
    },
});
