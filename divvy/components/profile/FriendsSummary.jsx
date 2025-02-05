// FriendsSummary.jsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, FlatList } from "react-native";
import { Users, ChevronRight, Check, Settings } from "lucide-react-native";
import { profileTheme } from "../../theme";
import { useFriends } from "../../hooks/useFriends";

const FriendsSummary = ({ navigation }) => {
    const { friends, selectedFriends, toggleFriendSelection, getSelectedFriendsData } =
        useFriends();
    const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
    const displayFriends = getSelectedFriendsData();

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    const handlePress = () => {
        navigation.navigate("Friends");
    };

    const renderFriendItem = ({ item: friend }) => (
        <TouchableOpacity
            style={styles.selectionItem}
            onPress={() => toggleFriendSelection(friend.id)}
        >
            <View style={styles.selectionItemContent}>
                {friend.avatar ? (
                    <Image source={{ uri: friend.avatar }} style={styles.selectionAvatar} />
                ) : (
                    <View style={styles.selectionAvatar}>
                        <Text style={styles.avatarText}>{getInitials(friend.name)}</Text>
                    </View>
                )}
                <Text style={styles.selectionName}>{friend.name}</Text>
            </View>
            {selectedFriends.includes(friend.id) && (
                <Check width={20} height={20} color={profileTheme.colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Featured Friends</Text>
                <TouchableOpacity
                    onPress={() => setIsSelectionModalVisible(true)}
                    style={styles.settingsButton}
                >
                    <Settings width={16} height={16} color={profileTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {friends.length > 0 ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.friendsList}>
                            {displayFriends.map(friend => (
                                <View key={friend.id} style={styles.friendItem}>
                                    {friend.avatar ? (
                                        <Image
                                            source={{ uri: friend.avatar }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {getInitials(friend.name)}
                                            </Text>
                                        </View>
                                    )}
                                    <Text style={styles.friendName} numberOfLines={1}>
                                        {friend.name.split(" ")[0]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <Users width={32} height={32} color={profileTheme.colors.gray300} />
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>No friends yet</Text>
                            <Text style={styles.emptySubtext}>
                                Add friends to start sharing expenses
                            </Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.footer} onPress={handlePress}>
                    <View style={styles.footerContent}>
                        <Users width={20} height={20} color={profileTheme.colors.text} />
                        <Text style={styles.footerText}>My Friends</Text>
                    </View>
                    <ChevronRight width={20} height={20} color={profileTheme.colors.text} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={isSelectionModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsSelectionModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Featured Friends</Text>
                            <Text style={styles.modalSubtitle}>
                                Choose up to 5 friends to feature on your profile
                            </Text>
                        </View>
                        <FlatList
                            data={friends}
                            renderItem={renderFriendItem}
                            keyExtractor={item => item.id.toString()}
                            style={styles.selectionList}
                        />
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => setIsSelectionModalVisible(false)}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: profileTheme.spacing.md,
    },
    headerText: {
        fontSize: 16,
        fontWeight: "600",
        color: profileTheme.colors.text,
    },
    settingsButton: {
        padding: 8,
    },
    container: {
        backgroundColor: profileTheme.colors.background,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    contentContainer: {
        padding: profileTheme.spacing.md,
    },
    friendsList: {
        flexDirection: "row",
        gap: profileTheme.spacing.md - 4,
    },
    friendItem: {
        alignItems: "center",
        width: 56,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: profileTheme.colors.gray100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: profileTheme.spacing.sm,
        borderWidth: 1,
        borderColor: profileTheme.colors.gray300,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: profileTheme.spacing.sm,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: profileTheme.colors.gray600,
    },
    friendName: {
        fontSize: 14,
        color: profileTheme.colors.gray600,
        textAlign: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: profileTheme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: profileTheme.colors.border,
    },
    footerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: profileTheme.spacing.sm,
    },
    footerText: {
        fontWeight: "500",
        color: profileTheme.colors.text,
    },
    emptyStateContainer: {
        padding: profileTheme.spacing.xl,
        flexDirection: "row",
        alignItems: "center",
        gap: profileTheme.spacing.md,
    },
    emptyTextContainer: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: profileTheme.colors.gray700,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: profileTheme.colors.gray500,
    },
    // Modal styles remain the same
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: profileTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        maxHeight: "80%",
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: profileTheme.colors.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: profileTheme.colors.gray500,
        textAlign: "center",
    },
    selectionList: {
        paddingHorizontal: 24,
    },
    selectionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: profileTheme.colors.border,
    },
    selectionItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    selectionAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: profileTheme.colors.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: profileTheme.colors.border,
    },
    selectionName: {
        fontSize: 16,
        color: profileTheme.colors.text,
    },
    doneButton: {
        margin: 24,
        backgroundColor: profileTheme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    doneButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default FriendsSummary;
