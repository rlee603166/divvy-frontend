// components/profile/GroupsList.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Users, Plus } from "lucide-react-native";
import { profileTheme } from "../../theme";
import { useGroups } from "../../context/GroupsContext";
import { useNavigation } from "@react-navigation/native";

const GroupsList = () => {
  const navigation = useNavigation();
  const { groups } = useGroups();

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetails', { group });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Plus width={16} height={16} color={profileTheme.colors.primary} />
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
      
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users width={40} height={40} color={profileTheme.colors.gray300} />
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>Create a group to start splitting bills with friends</Text>
        </View>
      ) : (
        <View style={styles.groupsList}>
          {groups.map((group) => (
            <TouchableOpacity 
              key={group.id} 
              style={styles.groupItem}
              onPress={() => handleGroupPress(group)}
            >
              {group.groupImage ? (
                <Image 
                  source={{ uri: group.groupImage }} 
                  style={styles.groupAvatar} 
                />
              ) : (
                <View style={styles.groupAvatar}>
                  <Users width={24} height={24} color="white" />
                </View>
              )}
              <View style={styles.groupInfo}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.membersCount}>
                    {group.members} members
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: profileTheme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  createButtonText: {
    fontSize: 14,
    color: profileTheme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: profileTheme.spacing.xl,
    backgroundColor: profileTheme.colors.gray[50],
    borderRadius: 16,
    marginTop: profileTheme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: profileTheme.colors.gray[500],
    marginTop: profileTheme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: profileTheme.colors.gray[400],
    textAlign: 'center',
    marginTop: profileTheme.spacing.sm,
  },
  groupsList: {
    gap: profileTheme.spacing.sm,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.md,
    padding: profileTheme.spacing.md,
    backgroundColor: profileTheme.colors.background,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: profileTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
  membersCount: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
  },
});

export default GroupsList;