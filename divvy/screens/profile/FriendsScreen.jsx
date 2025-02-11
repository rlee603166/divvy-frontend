// FriendsScreen.jsx
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
import { X, UserPlus, Users } from "lucide-react-native";
import { friendTheme } from "../../theme";
import SearchBar from "../../components/friends/SearchBar";
import { FriendListItem } from "../../components/friends/FriendListItem";
import { useFriends } from "../../hooks/useFriends";

export default function FriendsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const { friends, deleteFriend, deleteFriends } = useFriends();

    const filteredFriends = friends.filter(
        friend =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleEditMode = () => {
        if (editMode) {
            // Exiting edit mode clears any selections.
            setSelectedFriends([]);
        }
        setEditMode(!editMode);
    };

    const toggleSelection = friendId => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    };

    const handleDeleteSelected = () => {
        // Use the combined delete function for batch deletion with one confirmation.
        deleteFriend(selectedFriends);
        // Optionally, clear selections and exit edit mode after deletion:
        setSelectedFriends([]);
        setEditMode(false);
    };

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
                            onPress={() => navigation.navigate("SearchUsers")}
                        >
                            <UserPlus width={20} height={20} color={friendTheme.colors.primary} />
                            <Text style={styles.addButtonText}>Add New Friend</Text>
                        </TouchableOpacity>
                    </View>

                    {friends.length > 0 ? (
                        <>
                            <View style={styles.listHeaderContainer}>
                                <Text style={styles.listHeaderText}>
                                    All Friends • {filteredFriends.length}
                                </Text>
                                <TouchableOpacity onPress={toggleEditMode}>
                                    <Text style={styles.editButtonText}>
                                        {editMode ? "Done" : "Edit"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.friendsList}
                                showsVerticalScrollIndicator={false}
                            >
                                {filteredFriends.map(friend => (
                                    <FriendListItem
                                        key={friend.id}
                                        friend={friend}
                                        onPress={() => {
                                            if (!editMode) {
                                                console.log("Friend pressed:", friend);
                                            }
                                        }}
                                        editMode={editMode}
                                        selected={selectedFriends.includes(friend.id)}
                                        onSelect={toggleSelection}
                                    />
                                ))}

                                {filteredFriends.length === 0 && searchQuery && (
                                    <View style={styles.noResultsContainer}>
                                        <Text style={styles.noResultsText}>No friends found</Text>
                                    </View>
                                )}
                            </ScrollView>

                            {editMode && selectedFriends.length > 0 && (
                                <View style={styles.deleteButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={handleDeleteSelected}
                                    >
                                        <Text style={styles.deleteButtonText}>Remove Selected</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Users width={40} height={40} color={friendTheme.colors.gray300} />
                            <Text style={styles.emptyText}>No friends yet</Text>
                            <Text style={styles.emptySubtext}>
                                Add friends to start splitting bills and sharing expenses
                            </Text>
                        </View>
                    )}
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
    listHeaderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: friendTheme.spacing[4],
    },
    listHeaderText: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray500,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: "500",
        marginRight: 4,
        color: friendTheme.colors.primary,
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
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: friendTheme.spacing[4],
        backgroundColor: friendTheme.colors.white,
        borderRadius: 16,
        marginTop: friendTheme.spacing[4],
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
        marginTop: friendTheme.spacing[4],
    },
    emptySubtext: {
        fontSize: 14,
        color: friendTheme.colors.gray600,
        textAlign: "center",
        marginTop: friendTheme.spacing[2],
    },
    deleteButtonContainer: {
        marginTop: friendTheme.spacing[4],
        // Removed alignItems so that the button can stretch full width
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: friendTheme.colors.red500,
        padding: friendTheme.spacing[4],
        borderRadius: 16,
        width: "100%",
    },
    deleteButtonText: {
        color: friendTheme.colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});
