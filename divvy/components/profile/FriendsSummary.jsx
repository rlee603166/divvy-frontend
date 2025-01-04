import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Users, ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { profileTheme } from "../../theme";

const FriendsSummary = ({ navigation, friends }) => {

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

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                <View style={styles.friendsList}>
                    {friends.slice(0, 5).map(friend => (
                        <View key={friend.id} style={styles.friendItem}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials(friend.name)}</Text>
                            </View>
                            <Text style={styles.friendName} numberOfLines={1}>
                                {friend.name.split(" ")[0]}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

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
        color: profileTheme.colors.secondary,
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
});

export default FriendsSummary;
