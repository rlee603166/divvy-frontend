// src/screens/profile/FriendsScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { X, UserPlus } from "lucide-react-native";
import { friendTheme } from "../../theme";
import SearchBar from "../../components/friends/SearchBar";
import { FriendListItem } from "../../components/friends/FriendListItem";
import { useFriends } from "../../hooks/useFriends";


export default function FriendsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { friends, deleteFriend } = useFriends(); // Remove initialFriends parameter

    // Filter existing friends based on search query
    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Friends</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <X width={24} height={24} color={friendTheme.colors.gray600} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search friends..."
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('SearchUsers')}
                        >
                            <UserPlus width={20} height={20} color={friendTheme.colors.primary} />
                            <Text style={styles.addButtonText}>Add New Friend</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.listHeader}>
                        All Friends • {filteredFriends.length}
                    </Text>

                    <ScrollView 
                        style={styles.friendsList}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredFriends.map(friend => {
                            console.log('Rendering friend:', friend); // Add this line
                            return (
                                <FriendListItem
                                    key={friend.id}
                                    friend={friend}
                                    onPress={() => console.log("Friend pressed:", friend)}
                                    onDelete={() => deleteFriend(friend.id)}
                                />
                            );
                        })}

                        {filteredFriends.length === 0 && searchQuery && (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>No friends found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: friendTheme.colors.white,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: friendTheme.spacing[4],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
    },
    closeButton: {
        padding: friendTheme.spacing[2],
    },
    buttonContainer: {
        marginVertical: friendTheme.spacing[4],
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: friendTheme.colors.indigo50,
        padding: friendTheme.spacing[4],
        borderRadius: 16,
    },
    addButtonText: {
        marginLeft: friendTheme.spacing[2],
        fontSize: 16,
        fontWeight: "500",
        color: friendTheme.colors.primary,
    },
    listHeader: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray500,
        marginBottom: friendTheme.spacing[4],
    },
    friendsList: {
        flex: 1,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: friendTheme.spacing[8],
    },
    noResultsText: {
        fontSize: 16,
        color: friendTheme.colors.gray500,
    },
});