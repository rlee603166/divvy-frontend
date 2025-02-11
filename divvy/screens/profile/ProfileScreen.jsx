import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    Text,
    View,
} from "react-native";
import { profileTheme } from "../../theme";
import ProfileHeader from "../../components/profile/ProfileHeader";
import FriendsSummary from "../../components/profile/FriendsSummary";
import GroupsList from "../../components/profile/GroupsList";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "../../theme/index";

const ProfileScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
                    <Text style={styles.headerTitle}>Profile</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <ProfileHeader navigation={navigation} />
                <FriendsSummary navigation={navigation} />
                <GroupsList navigation={navigation} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: profileTheme.colors.gray[50],
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingHorizontal: 16,
        height: 30,
        justifyContent: "center",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.primary,
        marginLeft: 4,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: profileTheme.spacing.md,
        gap: profileTheme.spacing.xl,
    },
    
});

export default ProfileScreen;
