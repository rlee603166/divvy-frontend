// src/context/GroupsContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import UserService from "../services/UserService";
import { useUser } from "../services/UserProvider";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";

const GroupsContext = createContext();

const GroupsProvider = ({ children, initialGroups = [] }) => {
    const [groups, setGroups] = useState(() =>
        [...initialGroups].sort((a, b) => a.name.localeCompare(b.name))
    );

    const userService = new UserService();
    const { id, name, username, profileImage } = useUser();

    const user = {
        id: id,
        name: name,
        username: username,
        avatar: profileImage,
    };

    useEffect(() => {
        loadGroups(id);
    }, []);

    const loadGroups = async id => {
        const groupsData = await userService.getGroups(id);
        const data = groupsData.map((group, index) => ({
            id: group.group_id,
            name: group.name,
            groupImage: group.imageUri
                ? `${userService.apiURL}/images/groups/${group.imageUri}`
                : null,
            members: group.members.map(member => {
                let isLocalImage;
                if (member.users.imageUri) {
                    isLocalImage = !member.users.imageUri.startsWith("http");
                }
                const avatar = isLocalImage
                    ? `${userService.apiURL}/images/pfp/${member.users.imageUri}`
                    : member.users.imageUri;

                return {
                    id: member.user_id,
                    name: member.users.name,
                    username: member.users.username,
                    avatar: avatar,
                };
            }),
        }));

        setGroups(data.sort((a, b) => a.name.localeCompare(b.name)));
    };

    const createGroup = async (name, selectedFriends, groupImage = null) => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a group name");
            return false;
        }

        if (selectedFriends.length === 0) {
            Alert.alert("Error", "Please select at least one friend");
            return false;
        }

        if (groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
            Alert.alert("Error", "A group with this name already exists");
            return false;
        }

        const tempId = -Math.random();

        const newGroup = {
            id: tempId,
            name: name.trim(),
            members: [
                ...selectedFriends.map(friend => ({
                    ...friend,
                    username: friend.username.trim().startsWith("@")
                        ? friend.username.trim().slice(1)
                        : friend.username.trim(),
                })),
                {
                    ...user,
                    username: user.username.trim().startsWith("@")
                        ? user.username.trim().slice(1)
                        : user.username.trim(),
                },
            ],
            groupImage: groupImage,
        };

        console.log(JSON.stringify(newGroup, null, 2));

        setGroups(prevGroups =>
            [...prevGroups, newGroup].sort((a, b) => a.name.localeCompare(b.name))
        );

        try {
            const createdGroup = await userService.createGroup(newGroup);

            setGroups(prevGroups =>
                prevGroups
                    .map(group =>
                        group.id === tempId ? { ...group, id: createdGroup.group_id } : group
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
            );

            return true;
        } catch (error) {
            console.error("Failed to create group:", error);
            Alert.alert("Error", "Failed to create group. Please try again.");
            return false;
        }
    };

    const updateGroupName = (groupId, newName) => {
        if (!newName.trim()) {
            Alert.alert("Error", "Group name cannot be empty");
            return false;
        }

        if (
            groups.some(
                group => group.id !== groupId && group.name.toLowerCase() === newName.toLowerCase()
            )
        ) {
            Alert.alert("Error", "One of your groups already have this name");
            return false;
        }

        setGroups(prevGroups =>
            prevGroups
                .map(group => (group.id === groupId ? { ...group, name: newName.trim() } : group))
                .sort((a, b) => a.name.localeCompare(b.name))
        );

        const data = userService.updateGroupName(groupId, newName);
        return true;
    };

    const updateGroupImage = (groupId, imageUri) => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId ? { ...group, groupImage: imageUri } : group
            )
        );
        try {
            const photo = userService.updateGroupImage(groupId, imageUri);
            return true;
        } catch (error) {
            console.error("Failed to create group:", error);
            Alert.alert("Error", "Failed to create group. Please try again.");
            return false;
        }
    };

    const removeGroupImage = groupId => {
        setGroups(prevGroups =>
            prevGroups.map(group => (group.id === groupId ? { ...group, groupImage: null } : group))
        );

        try {
            const photo = userService.updateGroupImage(groupId, null);
            return true;
        } catch (error) {
            console.error("Failed to create group:", error);
            Alert.alert("Error", "Failed to create group. Please try again.");
            return false;
        }
    };

    const deleteGroup = groupId => {
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));

        try {
            const photo = userService.deleteGroup(groupId);
            return true;
        } catch (error) {
            console.error("Failed to create group:", error);
            Alert.alert("Error", "Failed to create group. Please try again.");
            return false;
        }
    };

    const updateGroupMembers = (groupId, newMembers) => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? {
                          ...group,
                          membersList: newMembers,
                          members: newMembers.length + 1, // +1 for current user
                          lastActive: new Date().toISOString(),
                      }
                    : group
            )
        );
    };

    const updateGroupLastActive = groupId => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId ? { ...group, lastActive: new Date().toISOString() } : group
            )
        );
    };

    const getGroupById = groupId => {
        return groups.find(group => group.id === groupId);
    };

    return (
        <GroupsContext.Provider
            value={{
                groups,
                createGroup,
                deleteGroup,
                updateGroupImage,
                removeGroupImage,
                updateGroupName,
                updateGroupMembers,
                updateGroupLastActive,
                getGroupById,
            }}
        >
            {children}
        </GroupsContext.Provider>
    );
};

const useGroups = () => {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error("useGroups must be used within a GroupsProvider");
    }
    return context;
};

export { GroupsProvider, useGroups };
