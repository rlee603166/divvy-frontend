// src/context/FriendsContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import UserService from "../services/UserService";
import { useUser } from "../services/UserProvider";

const FriendsContext = createContext();

export function FriendsProvider({ children, initialFriends = [] }) {
    // Initialize with the complete friend objects
    const [friends, setFriends] = useState(() =>
        [...initialFriends].sort((a, b) => a.name.localeCompare(b.name))
    );

    const { id, isAuthenicated } = useUser();
    const userService = new UserService();

    // Add state for selected friends
    const [selectedFriends, setSelectedFriends] = useState([]);

    useEffect(() => {
        if (friends) console.log(friends);
    }, [friends]);

    useEffect(() => {
        loadFriends(id);
    }, []);

    const loadFriends = async id => {
        const friendsData = await userService.getFriends(id);
        const data = friendsData.map((friend, index) => {
            let isLocalImage;
            if (friend.imageUri) {
                isLocalImage = !friend.imageUri.startsWith("http");
            }

            const avatar = isLocalImage
                ? `${userService.apiURL}/images/pfp/${friend.imageUri}`
                : friend.imageUri;

            console.log(avatar);

            return {
                id: friend.user_id,
                friend_id: friend.friend_id,
                name: friend.name,
                phone: `${friend.phone}` || "",
                username: `${friend.username}` || "",
                avatar: avatar || null,
                selected: false,
            };
        });
        setFriends(data);
    };

    const addFriend = (userOrName, username) => {
        let newFriend;

        if (typeof userOrName === "object") {
            const user = userOrName;
            newFriend = {
                ...user,
                status: user.status || "active",
            };
        } else {
            if (!userOrName.trim() || !username.trim()) {
                Alert.alert("Error", "Please fill in both name and username");
                return false;
            }

            const formattedUsername = username.trim().startsWith("@")
                ? username.trim().slice(1)
                : username.trim();

            const id = Math.max(...friends.map(f => f.id), 0) + 1;

            newFriend = {
                id,
                name: userOrName.trim(),
                username: formattedUsername,
                status: "active",
            };
        }

        if (
            friends.some(
                friend => friend.username.toLowerCase() === newFriend.username.toLowerCase()
            )
        ) {
            Alert.alert("Error", "This username already exists");
            return false;
        }

        setFriends(prevFriends =>
            [...prevFriends, newFriend].sort((a, b) => a.name.localeCompare(b.name))
        );

        try {
            const data = userService.addFriend(newFriend.id);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const deleteFriend = friendIds => {
        const ids = Array.isArray(friendIds) ? friendIds : [friendIds];

        Alert.alert(
            ids.length > 1 ? "Remove Friends" : "Remove Friend",
            ids.length > 1
                ? "Are you sure you want to remove these friends?"
                : "Are you sure you want to remove this friend?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        setFriends(prevFriends =>
                            prevFriends.filter(friend => !ids.includes(friend.id))
                        );
                        setSelectedFriends(prev => prev.filter(id => !ids.includes(id)));

                        try {
                            const results = await Promise.all(
                                ids.map(friendId => userService.removeFriend(friendId))
                            );

                            const allSuccess = results.every(result => result);

                            if (!allSuccess) {
                                console.warn("Some friend removals failed");
                            }

                            return allSuccess;
                        } catch (error) {
                            console.error("Error removing friends:", error);
                            return false;
                        }
                    },
                },
            ]
        );
    };
    // Add function to toggle friend selection
    const toggleFriendSelection = friendId => {
        setSelectedFriends(prev => {
            if (prev.includes(friendId)) {
                return prev.filter(id => id !== friendId);
            }
            if (prev.length >= 5) {
                Alert.alert("Maximum Selection", "You can only select up to 5 friends to display");
                return prev;
            }
            return [...prev, friendId];
        });
    };

    // Add function to get selected friends' data
    const getSelectedFriendsData = () => {
        if (selectedFriends.length === 0) {
            return friends.slice(0, 5); // Default to first 5 if none selected
        }
        return friends.filter(friend => selectedFriends.includes(friend.id));
    };

    return (
        <FriendsContext.Provider
            value={{
                friends,
                addFriend,
                deleteFriend,
                selectedFriends,
                toggleFriendSelection,
                getSelectedFriendsData,
            }}
        >
            {children}
        </FriendsContext.Provider>
    );
}

export function useFriends(initialFriendsList = []) {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error("useFriends must be used within a FriendsProvider");
    }

    if (initialFriendsList.length > 0 && context.friends.length === 0) {
        initialFriendsList.forEach(friend => {
            context.addFriend(friend);
        });
    }

    return context;
}
