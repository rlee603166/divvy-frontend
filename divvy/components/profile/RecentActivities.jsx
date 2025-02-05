// src/components/profile/RecentActivities.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Clock, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { profileTheme } from '../../theme';
import { useUser } from '../../services/UserProvider';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../context/GroupsContext';

const ACTIVITY_TYPES = {
  PAYMENT_SENT: 'PAYMENT_SENT',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  GROUP_EXPENSE: 'GROUP_EXPENSE',
  FRIEND_ADDED: 'FRIEND_ADDED',
  GROUP_CREATED: 'GROUP_CREATED'
};

const RecentActivities = ({ navigation }) => {
  const { username } = useUser();
  const { friends } = useFriends();
  const { groups } = useGroups();
  const [activities, setActivities] = useState([]);

  // Mock data generation - replace with real data integration
  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: ACTIVITY_TYPES.PAYMENT_RECEIVED,
        amount: 25.50,
        fromUser: friends[0],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 2,
        type: ACTIVITY_TYPES.GROUP_EXPENSE,
        amount: 45.00,
        group: { name: 'Lunch Group', id: 1 },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 3,
        type: ACTIVITY_TYPES.PAYMENT_SENT,
        amount: 15.75,
        toUser: friends[1],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
    ];

    setActivities(mockActivities);
  }, [friends, groups]);

  const getFormattedTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.PAYMENT_RECEIVED:
        return <ArrowUpRight color={profileTheme.colors.green} size={16} />;
      case ACTIVITY_TYPES.PAYMENT_SENT:
        return <ArrowDownLeft color={profileTheme.colors.red} size={16} />;
      case ACTIVITY_TYPES.GROUP_EXPENSE:
        return <Users color={profileTheme.colors.primary} size={16} />;
      default:
        return <Clock color={profileTheme.colors.gray[400]} size={16} />;
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case ACTIVITY_TYPES.PAYMENT_RECEIVED:
        return `Received from ${activity.fromUser?.name || 'Unknown'}`;
      case ACTIVITY_TYPES.PAYMENT_SENT:
        return `Sent to ${activity.toUser?.name || 'Unknown'}`;
      case ACTIVITY_TYPES.GROUP_EXPENSE:
        return `Group expense in ${activity.group?.name || 'Unknown Group'}`;
      default:
        return 'Unknown activity';
    }
  };

  const getAmountColor = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.PAYMENT_RECEIVED:
        return profileTheme.colors.green;
      case ACTIVITY_TYPES.PAYMENT_SENT:
        return profileTheme.colors.red;
      default:
        return profileTheme.colors.text;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={16} color={profileTheme.colors.gray[400]} />
        <Text style={styles.headerText}>Recent Activity</Text>
      </View>

      <ScrollView style={styles.activityList}>
        {activities.map((activity) => (
          <Pressable
            key={activity.id}
            style={styles.activityItem}
            onPress={() => {
              // Handle activity press - navigate to detail view
              // navigation.navigate('ActivityDetail', { activityId: activity.id });
            }}
          >
            <View style={styles.activityLeft}>
              {getActivityIcon(activity.type)}
              <View style={styles.activityDetails}>
                <Text style={styles.activityDescription}>
                  {getActivityDescription(activity)}
                </Text>
                <Text style={styles.timestamp}>
                  {getFormattedTimestamp(activity.timestamp)}
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.amount,
              { color: getAmountColor(activity.type) }
            ]}>
              ${activity.amount.toFixed(2)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: profileTheme.colors.background,
    borderRadius: 16,
    padding: profileTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.xs,
    marginBottom: profileTheme.spacing.md,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: profileTheme.colors.gray[600],
  },
  activityList: {
    maxHeight: 200,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: profileTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: profileTheme.colors.gray[100],
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.sm,
  },
  activityDetails: {
    gap: 2,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: profileTheme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: profileTheme.colors.gray[400],
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecentActivities;
