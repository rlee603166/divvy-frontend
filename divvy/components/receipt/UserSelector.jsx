import React from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../services/UserProvider";
import theme from "../../theme/index";

const getInitials = name => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        // If single word, take up to first two characters
        return words[0].substring(0, 2).toUpperCase();
    }
    // Take first character of first and last word
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Updated UserSelector component
const UserSelector = ({ group, selectedUser, onSelectUser }) => {
    const { id, avatar } = useUser();

    const getImageSource = member => {
        if (member.id === "you" || member.id === id) {
            return avatar;
        }
        return member.avatar || member.profileImage || member.image;
    };

    const renderAvatar = (member, isSelected) => {
        const imageSource = getImageSource(member);

        if (imageSource) {
            return (
                <Image
                    source={{ uri: imageSource }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    transition={200}
                />
            );
        }

        return (
            <Text style={[styles.avatarText, isSelected && styles.selectedAvatarText]}>
                {getInitials(member.name)}
            </Text>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={styles.userButton}
                    onPress={() => onSelectUser("everyone")}
                >
                    <View
                        style={[
                            styles.avatarContainer,
                            {
                                backgroundColor:
                                    selectedUser === "everyone"
                                        ? `${theme.colors.primary}10`
                                        : "#f0f0f0",
                            },
                        ]}
                    >
                        <Ionicons
                            name="people"
                            size={28}
                            color={selectedUser === "everyone" ? theme.colors.primary : "#666"}
                        />
                        {selectedUser === "everyone" && <View style={styles.selectedBorder} />}
                    </View>
                    <Text
                        style={[
                            styles.userName,
                            selectedUser === "everyone" && styles.selectedUserName,
                        ]}
                    >
                        Everyone
                    </Text>
                </TouchableOpacity>

                {group.members.map(member => (
                    <TouchableOpacity
                        key={member.id}
                        style={styles.userButton}
                        onPress={() => onSelectUser(member.id)}
                    >
                        <View style={styles.avatarContainer}>
                            {renderAvatar(member, selectedUser === member.id)}
                            {selectedUser === member.id && <View style={styles.selectedBorder} />}
                        </View>
                        <Text
                            style={[
                                styles.userName,
                                selectedUser === member.id && styles.selectedUserName,
                            ]}
                        >
                            {member.name.split(" ")[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        paddingTop: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 20,
    },
    userButton: {
        alignItems: "center",
        gap: 8,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },
    selectedBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "600",
        color: "#666",
    },
    selectedAvatarText: {
        color: theme.colors.primary,
    },
    userName: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    selectedUserName: {
        color: theme.colors.primary,
        fontWeight: "600",
    },
});

export default UserSelector;
