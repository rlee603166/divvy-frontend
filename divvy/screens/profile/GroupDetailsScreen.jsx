import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Modal,
    TextInput,
    Alert,
    Platform,
    Linking,
} from "react-native";
import { ArrowLeft, Users, MoreVertical, Trash2, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { friendTheme } from "../../theme";
import { useGroups } from "../../context/GroupsContext";
import { useUser } from "../../services/UserProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EditNameModal = ({ visible, onClose, onSave, initialValue }) => {
    const [name, setName] = React.useState(initialValue);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const OptionsMenu = ({ visible, onClose, options }) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.optionsOverlay} activeOpacity={1} onPress={onClose}>
                <View
                    style={[
                        styles.optionsContainer,
                        { paddingBottom: Math.max(insets.bottom, 20) },
                    ]}
                >
                    <View style={styles.optionsContent}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionItem,
                                    option.destructive && styles.destructiveOption,
                                ]}
                                onPress={() => {
                                    onClose();
                                    setTimeout(() => option.onPress(), 300);
                                }}
                            >
                                {option.icon && (
                                    <View style={styles.optionIconContainer}>{option.icon}</View>
                                )}
                                <Text
                                    style={[
                                        styles.optionText,
                                        option.destructive && styles.destructiveText,
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const GroupDetailsScreen = ({ navigation, route }) => {
    const {
        groups,
        updateGroupImage,
        removeGroupImage,
        deleteGroup,
        updateGroupName,
        getGroupById,
    } = useGroups();
    const groupId = route.params.group.id;
    const group = getGroupById(groupId);
    const {
        name: currentUserName,
        username: currentUserUsername,
        profileImage: currentUserAvatar,
        id,
    } = useUser();

    const [localGroupImage, setLocalGroupImage] = useState(group?.groupImage);
    const [showNameModal, setShowNameModal] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalGroupImage(group?.groupImage);
    }, [group?.groupImage]);

    const loggedInUser = group.members.find(member => member.id === id);

    const updatedMembers = group.members.filter(member => member.id !== id);

    const currentUser = loggedInUser
        ? {
              id: "current-user",
              name: loggedInUser.name,
              username: loggedInUser.username,
              avatar: loggedInUser.avatar,
          }
        : null;
    const allMembers = [currentUser, ...(updatedMembers || [])];

    const handleUpdateGroupName = useCallback(
        newName => {
            if (newName.trim()) {
                updateGroupName(group.id, newName.trim());
            }
        },
        [group?.id, updateGroupName]
    );

    const pickImage = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            console.log("Starting image picker process...");

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            console.log("Image picker result:", result);

            if (!result.canceled && result.assets?.[0]) {
                const selectedAsset = result.assets[0];
                console.log("Selected asset:", selectedAsset);

                setLocalGroupImage(selectedAsset.uri);
                await updateGroupImage(group.id, selectedAsset.uri);
            }
        } catch (error) {
            console.error("Error in pickImage:", error);
            Alert.alert("Error", "Failed to open photo library. Please try again.", [
                { text: "OK" },
            ]);
            setLocalGroupImage(group?.groupImage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (isLoading) return;

        Alert.alert("Remove Photo", "Are you sure you want to remove the group photo?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsLoading(true);
                        await removeGroupImage(group.id);
                        setLocalGroupImage(null);
                    } catch (error) {
                        console.error("Error removing image:", error);
                        Alert.alert("Error", "Failed to remove group photo. Please try again.");
                    } finally {
                        setIsLoading(false);
                    }
                },
            },
        ]);
    };

    const handleDeleteGroup = () => {
        Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Leave",
                style: "destructive",
                onPress: () => {
                    deleteGroup(group.id);
                    navigation.goBack();
                },
            },
        ]);
    };

    const openImageOptions = async () => {
        setShowOptionsMenu(false);

        try {
            const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                const { status: newStatus } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (newStatus !== "granted") {
                    Alert.alert(
                        "Permission Required",
                        "Please grant access to your photo library to change the group picture.",
                        [{ text: "OK" }]
                    );
                    return;
                }
            }

            setTimeout(() => pickImage(), 300);
        } catch (error) {
            console.error("Error checking permissions:", error);
            Alert.alert("Error", "Failed to access photo library. Please try again.", [
                { text: "OK" },
            ]);
        }
    };

    const optionsMenuItems = [
        {
            text: "Edit Group Name",
            onPress: () => setShowNameModal(true),
        },
        {
            text: localGroupImage ? "Change Group Photo" : "Add Group Photo",
            onPress: openImageOptions,
        },
        ...(localGroupImage
            ? [
                  {
                      text: "Remove Photo",
                      onPress: handleRemoveImage,
                      destructive: true,
                  },
              ]
            : []),
        {
            text: "Leave Group",
            onPress: handleDeleteGroup,
            destructive: true,
        },
    ];

    if (!group) {
        navigation.goBack();
        return null;
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft width={24} height={24} color={friendTheme.colors.gray600} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Group Info</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowOptionsMenu(true)}
                    >
                        <MoreVertical width={24} height={24} color={friendTheme.colors.gray600} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.imageSection}>
                        <View style={styles.imageContainer}>
                            {localGroupImage ? (
                                <Image
                                    source={{ uri: localGroupImage }}
                                    style={styles.groupImage}
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Users
                                        width={40}
                                        height={40}
                                        color={friendTheme.colors.gray400}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.groupInfoContainer}>
                        <Text style={styles.groupNameDisplay}>{group.name}</Text>
                    </View>

                    <View style={styles.membersContainer}>
                        <Text style={styles.sectionTitle}>Members • {allMembers.length}</Text>

                        <View style={styles.membersList}>
                            {allMembers.map(member => (
                                <View key={member.id} style={styles.userItem}>
                                    <View style={styles.leftContainer}>
                                        {member &&
                                            (member.avatar ? (
                                                <Image
                                                    source={{ uri: member.avatar }}
                                                    style={styles.avatar}
                                                />
                                            ) : (
                                                <View style={styles.avatarPlaceholder}>
                                                    <Text style={styles.avatarText}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                            ))}
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>
                                                {member && member.name}
                                                {member && member.id === "current-user" && (
                                                    <Text style={styles.currentUser}> (You)</Text>
                                                )}
                                            </Text>
                                            <Text style={styles.userUsername}>
                                                @{member && member.username}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <EditNameModal
                    visible={showNameModal}
                    onClose={() => setShowNameModal(false)}
                    onSave={handleUpdateGroupName}
                    initialValue={group.name}
                />

                <OptionsMenu
                    visible={showOptionsMenu}
                    onClose={() => setShowOptionsMenu(false)}
                    options={optionsMenuItems}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: friendTheme.colors.white,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
    },
    backButton: {
        padding: friendTheme.spacing[2],
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
        flex: 1,
        textAlign: "center",
    },
    content: {
        flex: 1,
    },
    imageSection: {
        alignItems: "center",
        paddingVertical: friendTheme.spacing[4],
    },
    imageContainer: {
        alignItems: "center",
    },
    groupImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: friendTheme.spacing[3],
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: friendTheme.colors.gray100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: friendTheme.spacing[3],
    },
    groupInfoContainer: {
        alignItems: "center",
        paddingHorizontal: friendTheme.spacing[4],
        marginBottom: friendTheme.spacing[3],
    },
    groupNameDisplay: {
        fontSize: 22,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
        textAlign: "center",
    },
    membersContainer: {
        marginTop: friendTheme.spacing[3],
        paddingTop: friendTheme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: friendTheme.colors.gray50,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray600,
        paddingHorizontal: friendTheme.spacing[4],
        marginBottom: friendTheme.spacing[2],
    },
    membersList: {
        paddingHorizontal: friendTheme.spacing[4],
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: friendTheme.spacing[4],
        paddingHorizontal: friendTheme.spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: friendTheme.spacing[3],
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: friendTheme.colors.gray100,
        alignItems: "center",
        justifyContent: "center",
        marginRight: friendTheme.spacing[3],
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: friendTheme.colors.gray600,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "500",
        color: friendTheme.colors.gray900,
    },
    currentUser: {
        color: friendTheme.colors.primary,
        fontWeight: "400",
    },
    userUsername: {
        fontSize: 14,
        color: friendTheme.colors.gray500,
        marginTop: 2,
    },
    // Edit Name Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 14,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
        color: friendTheme.colors.gray900,
    },
    input: {
        fontSize: 16,
        padding: 12,
        backgroundColor: friendTheme.colors.gray50,
        borderRadius: 10,
        marginBottom: 20,
        color: friendTheme.colors.gray900,
    },
    saveButton: {
        backgroundColor: friendTheme.colors.primary,
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
    },
    saveButtonText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        padding: 14,
    },
    cancelButtonText: {
        color: friendTheme.colors.gray600,
        textAlign: "center",
        fontSize: 16,
    },
    // Options Menu Styles
    optionsOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    optionsContainer: {
        paddingHorizontal: 8,
    },
    optionsContent: {
        backgroundColor: "white",
        borderRadius: 14,
        marginBottom: 8,
        overflow: "hidden",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    optionIconContainer: {
        marginRight: 8,
    },
    optionText: {
        fontSize: 16,
        textAlign: "center",
        color: friendTheme.colors.gray900,
        fontWeight: "400",
    },
    destructiveOption: {
        backgroundColor: "transparent",
    },
    destructiveText: {
        color: friendTheme.colors.red500,
        fontWeight: "400",
    },
    cancelButton: {
        backgroundColor: "white",
        borderRadius: 14,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "400",
        textAlign: "center",
        color: friendTheme.colors.gray900,
        paddingVertical: 16,
    },
});

export default GroupDetailsScreen;
