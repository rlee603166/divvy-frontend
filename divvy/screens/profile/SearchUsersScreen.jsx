// src/screens/profile/SearchUsersScreen.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { X, UserPlus } from "lucide-react-native";
import { Image } from "react-native";
import { friendTheme } from "../../theme";
import SearchBar from "../../components/friends/SearchBar";
import { useFriends } from "../../hooks/useFriends";

const allUsers = [
  { 
    id: 1, 
    name: "Sarah Miller", 
    username: "@sarahm", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=sarah" 
  },
  { 
    id: 2, 
    name: "Mike Chen", 
    username: "@mikechen", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=mike" 
  },
  { 
    id: 3, 
    name: "Jordan Lee", 
    username: "@jlee", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=jordan" 
  },
  { 
    id: 4, 
    name: "Emma Watson", 
    username: "@emmaw", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=emma" 
  },
  { 
    id: 5, 
    name: "John Smith", 
    username: "@johnsmith", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=john" 
  },
  { 
    id: 6, 
    name: "Sara Jones", 
    username: "@saraj", 
    status: "active", 
    avatar: "https://i.pravatar.cc/150?u=sara" 
  },
  {
    id: 7,
    name: "Addison Clark",
    username: "@addisonc",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=addisonc"
  },
  {
    id: 8,
    name: "Oliver Johnson",
    username: "@oliverj",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=oliverj"
  },
  {
    id: 9,
    name: "Isabella Garcia",
    username: "@isabellag",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=isabellag"
  },
  {
    id: 10,
    name: "James Wilson",
    username: "@jamesw",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=jamesw"
  },
];

function SearchUsersScreen({ navigation }) {
        const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [addedFriends, setAddedFriends] = useState(new Set());
    
    const { friends, addFriend } = useFriends();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = () => {
        setIsSearching(true);

        // Simulate API call delay
        setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const results = allUsers.filter(user => 
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query)
            );

            setSearchResults(results);
            setIsSearching(false);
        }, 500);
    };

    const handleAddFriend = (user) => {
        setAddedFriends(prev => new Set([...prev, user.id]));
        addFriend(user);
    };

    const isUserFriend = (user) => {
        return friends.some(friend => friend.id === user.id) || addedFriends.has(user.id);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Find People</Text>
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
                        placeholder="Search by name or username..."
                        autoFocus={true}
                    />

                    {isSearching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={friendTheme.colors.primary} />
                        </View>
                    ) : searchQuery && searchResults.length === 0 ? (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsText}>No users found</Text>
                        </View>
                    ) : (
                        <ScrollView 
                            style={styles.searchResults}
                            showsVerticalScrollIndicator={false}
                        >
                            {searchResults.map(user => (
                                <View key={user.id} style={styles.userItem}>
                                    <View style={styles.leftContainer}>
                                        <Image
                                            source={{ uri: user.avatar }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <Text style={styles.userUsername}>{user.username}</Text>
                                        </View>
                                    </View>
                                    {!isUserFriend(user) ? (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => handleAddFriend(user)}
                                        >
                                            <UserPlus width={20} height={20} color={friendTheme.colors.primary} />
                                            <Text style={styles.addButtonText}>Add</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.addedButton}>
                                            <Text style={styles.addedText}>Added</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
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
    searchResults: {
        flex: 1,
        marginTop: friendTheme.spacing[4],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: friendTheme.spacing[8],
    },
    noResultsText: {
        fontSize: 16,
        color: friendTheme.colors.gray500,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: friendTheme.spacing[4],
        paddingHorizontal: friendTheme.spacing[2],
        marginBottom: friendTheme.spacing[2],
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: friendTheme.spacing[3],
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: friendTheme.colors.gray900,
    },
    userUsername: {
        fontSize: 14,
        color: friendTheme.colors.gray500,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: friendTheme.colors.indigo50,
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[2],
        borderRadius: 16,
    },
    addButtonText: {
        marginLeft: friendTheme.spacing[2],
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.primary,
    },
    addedButton: {
        backgroundColor: friendTheme.colors.gray100,
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[2],
        borderRadius: 16,
    },
    addedText: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray500,
    },
});

export default SearchUsersScreen;