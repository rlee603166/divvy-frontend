// components/friends/FriendListItem.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Check } from "lucide-react-native";
import { friendTheme } from "../../theme";

export function FriendListItem({ friend, onPress, editMode, selected, onSelect }) {
    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    // In edit mode, tapping toggles selection.
    // Otherwise, it triggers the normal onPress callback.
    const handlePress = () => {
        if (editMode && onSelect) {
            onSelect(friend.id);
        } else if (onPress) {
            onPress(friend);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={[styles.friendItem, editMode && selected ? styles.selectedItem : null]}
        >
            <View style={styles.avatarContainer}>
                {friend?.avatar ? (
                    <Image
                        source={{ uri: friend.avatar }}
                        style={styles.avatarImage}
                        onError={e => {
                            console.error("Image loading error:", e.nativeEvent.error);
                        }}
                        onLoad={() => console.log("Image loaded successfully")}
                    />
                ) : (
                    <Text style={styles.avatarText}>{getInitials(friend.name)}</Text>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {friend.name}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                    {friend.username}
                </Text>
            </View>

            {editMode && (
                <View
                    style={[
                        styles.checkboxContainer,
                        selected && {
                            backgroundColor: friendTheme.colors.primary,
                            borderColor: friendTheme.colors.primary,
                        },
                    ]}
                >
                    {selected && <Check width={16} height={16} color={friendTheme.colors.white} />}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: friendTheme.spacing[3],
        backgroundColor: friendTheme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
    },
    // selectedItem: {
    //   backgroundColor: friendTheme.colors.indigo50,
    // },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: friendTheme.colors.gray100,
        justifyContent: "center",
        alignItems: "center",
        marginRight: friendTheme.spacing[3],
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: friendTheme.colors.gray600,
    },
    infoContainer: {
        flex: 1,
        marginRight: friendTheme.spacing[3],
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
        marginBottom: friendTheme.spacing[1],
    },
    username: {
        fontSize: 14,
        color: friendTheme.colors.gray500,
    },
    checkboxContainer: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: friendTheme.colors.gray400,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default FriendListItem;
