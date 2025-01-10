// src/context/GroupsContext.js
import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const GroupsContext = createContext();

const GroupsProvider = ({ children, initialGroups = [] }) => {
  const [groups, setGroups] = useState(() => 
    [...initialGroups].sort((a, b) => a.name.localeCompare(b.name))
  );

  const createGroup = (name, selectedFriends, groupImage = null) => {
    if (!name.trim()) {
      Alert.alert(
        'Error',
        'Please enter a group name'
      );
      return false;
    }

    if (selectedFriends.length === 0) {
      Alert.alert(
        'Error',
        'Please select at least one friend'
      );
      return false;
    }

    // Check for duplicate group name
    if (groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert(
        'Error',
        'A group with this name already exists'
      );
      return false;
    }

    const newGroup = {
      id: Math.max(...groups.map(g => g.id), 0) + 1,
      name: name.trim(),
      members: selectedFriends.length + 1, // +1 for current user
      lastActive: new Date().toISOString(),
      membersList: selectedFriends,
      groupImage: groupImage
    };

    setGroups(prevGroups => 
      [...prevGroups, newGroup].sort((a, b) => a.name.localeCompare(b.name))
    );
    return true;
  };

  const updateGroupName = (groupId, newName) => {
    if (!newName.trim()) {
      Alert.alert(
        'Error',
        'Group name cannot be empty'
      );
      return false;
    }

    // Check for duplicate group name
    if (groups.some(group => 
      group.id !== groupId && 
      group.name.toLowerCase() === newName.toLowerCase()
    )) {
      Alert.alert(
        'Error',
        'A group with this name already exists'
      );
      return false;
    }

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { ...group, name: newName.trim() }
          : group
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
    return true;
  };

  const updateGroupImage = (groupId, imageUri) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { ...group, groupImage: imageUri }
          : group
      )
    );
  };

  const removeGroupImage = (groupId) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { ...group, groupImage: null }
          : group
      )
    );
  };

  const deleteGroup = (groupId) => {
    setGroups(prevGroups => 
      prevGroups.filter(group => group.id !== groupId)
    );
  };

  const updateGroupMembers = (groupId, newMembers) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { 
              ...group, 
              membersList: newMembers,
              members: newMembers.length + 1, // +1 for current user
              lastActive: new Date().toISOString()
            }
          : group
      )
    );
  };

  const updateGroupLastActive = (groupId) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { ...group, lastActive: new Date().toISOString() }
          : group
      )
    );
  };

  const getGroupById = (groupId) => {
    return groups.find(group => group.id === groupId);
  };

  return (
    <GroupsContext.Provider value={{ 
      groups, 
      createGroup, 
      deleteGroup,
      updateGroupImage,
      removeGroupImage,
      updateGroupName,
      updateGroupMembers,
      updateGroupLastActive,
      getGroupById
    }}>
      {children}
    </GroupsContext.Provider>
  );
};

const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
};

export { GroupsProvider, useGroups };