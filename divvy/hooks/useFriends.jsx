// src/context/FriendsContext.js
import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const FriendsContext = createContext();

export function FriendsProvider({ children, initialFriends = [] }) {
  // Initialize with the complete friend objects
  const [friends, setFriends] = useState(() => 
    [...initialFriends].sort((a, b) => a.name.localeCompare(b.name))
  );

  const addFriend = (userOrName, username) => {
    let newFriend;

    if (typeof userOrName === 'object') {
      // If we're passed a user object, preserve all properties
      const user = userOrName;
      newFriend = {
        ...user,  // Spread the entire user object to keep all properties
        status: user.status || "active"
      };
    } else {
      // If we're passed individual fields
      if (!userOrName.trim() || !username.trim()) {
        Alert.alert('Error', 'Please fill in both name and username');
        return false;
      }

      const formattedUsername = username.trim().startsWith('@') 
        ? username.trim() 
        : `@${username.trim()}`;
      
      const id = Math.max(...friends.map(f => f.id), 0) + 1;

      newFriend = {
        id,
        name: userOrName.trim(),
        username: formattedUsername,
        status: "active"
      };
    }

    // Check for duplicate username
    if (friends.some(friend => friend.username.toLowerCase() === newFriend.username.toLowerCase())) {
      Alert.alert('Error', 'This username already exists');
      return false;
    }

    setFriends(prevFriends => 
      [...prevFriends, newFriend].sort((a, b) => a.name.localeCompare(b.name))
    );
    return true;
  };

  const deleteFriend = (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFriends(prevFriends => 
              prevFriends.filter(friend => friend.id !== friendId)
            );
          },
        },
      ]
    );
  };

  return (
    <FriendsContext.Provider value={{ friends, addFriend, deleteFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends(initialFriendsList = []) {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  
  // If we're called with initialFriends and the context is empty, initialize it
  if (initialFriendsList.length > 0 && context.friends.length === 0) {
    initialFriendsList.forEach(friend => {
      context.addFriend(friend);
    });
  }
  
  return context;
}