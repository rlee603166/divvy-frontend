// components/profile/FriendRequest.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, UserPlus, ChevronRight, Check, X } from "lucide-react-native";
import { profileTheme } from "../../theme";

const FriendRequests = ({ requests, onAccept, onReject }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Friend Requests ({requests.length})</Text>
        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User width={24} height={24} color="white" />
                </View>
                <View>
                  <Text style={styles.name}>{request.name}</Text>
                  <Text style={styles.mutualFriends}>
                    {request.mutualFriends} mutual friends
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onAccept(request.id)}
                >
                  <Check width={24} height={24} color={profileTheme.colors.green} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onReject(request.id)}
                >
                  <X width={24} height={24} color={profileTheme.colors.red} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.footer}>
        <View style={styles.footerContent}>
          <UserPlus width={20} height={20} color={profileTheme.colors.secondary} />
          <Text style={styles.footerText}>All Friend Requests</Text>
        </View>
        <ChevronRight width={20} height={20} color={profileTheme.colors.secondary} />
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
    marginVertical: profileTheme.spacing.md,
  },
  content: {
    padding: profileTheme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: profileTheme.colors.text,
    marginBottom: profileTheme.spacing.md,
  },
  requestsList: {
    gap: profileTheme.spacing.md,
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: profileTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
  mutualFriends: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: profileTheme.spacing.sm,
  },
  actionButton: {
    padding: profileTheme.spacing.sm,
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

export default FriendRequests;
