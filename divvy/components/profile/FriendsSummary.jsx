
// FriendsSummary.jsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { Users, ChevronRight } from "lucide-react-native";
import { profileTheme } from "../../theme";
import { useFriends } from "../../hooks/useFriends";

const FriendsSummary = ({ navigation }) => {
    const { friends } = useFriends();
    const displayFriends = friends.slice(0, 5);

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

    // Calculate container width based on number of friends
    const getContainerWidth = () => {
        const itemWidth = 56; // Width of each friend item
        const gap = 12; // Gap between items
        if (friends.length === 0) return '100%';
        const totalWidth = (displayFriends.length * itemWidth) + ((displayFriends.length - 1) * gap);
        return totalWidth;
    };

    return (
        <View style={styles.container}>
            {friends.length > 0 ? (
                <View style={styles.contentContainer}>
                    <View style={[styles.friendsList, { width: getContainerWidth() }]}>
                        {displayFriends.map(friend => (
                            <View key={friend.id} style={styles.friendItem}>
                                {friend.avatar ? (
                                    <Image 
                                        source={{ uri: friend.avatar }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{getInitials(friend.name)}</Text>
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
                        <Text style={styles.emptySubtext}>Add friends to start sharing expenses</Text>
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
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: profileTheme.colors.background,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    scrollView: {
        padding: profileTheme.spacing.md,
    },
    friendsList: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "space-around",
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
        borderWidth: 1, // Add border width
        borderColor: profileTheme.colors.gray300, // Add border color
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
    emptyContainer: {
        padding: profileTheme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: profileTheme.colors.gray400,
    },
    contentContainer: {
        alignItems: 'center',
        padding: profileTheme.spacing.md,
    },
    friendsList: {
        flexDirection: "row",
        justifyContent: "center",
        gap: profileTheme.spacing.md - 4,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: profileTheme.spacing.sm,
    },
    emptyStateContainer: {
        padding: profileTheme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: profileTheme.spacing.md,
    },
    emptyTextContainer: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: profileTheme.colors.gray700,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: profileTheme.colors.gray500,
    },
});

export default FriendsSummary;