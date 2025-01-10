import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { profileTheme } from '../../theme';

import ProfileHeader from '../../components/profile/ProfileHeader';
import BalanceSummary from '../../components/profile/BalanceSummary';
import FriendsSummary from '../../components/profile/FriendsSummary';
import GroupsList from '../../components/profile/GroupsList';

const ProfileScreen = ({ navigation }) => {
  const [balance] = useState({
    toReceive: 125.50,
    toPay: 45.75
  });
  
  const [friends] = useState([
    { id: 1, name: "Sarah Miller", username: "@sarahm", status: "active" },
    { id: 2, name: "Mike Chen", username: "@mikechen", status: "active" },
    { id: 3, name: "Jordan Lee", username: "@jlee", status: "active" },
    { id: 4, name: "Emma Wilson", username: "@emmaw", status: "active" },
    { id: 5, name: "Alex Zhang", username: "@azhang", status: "active" },
  ]);

  const [groups] = useState([
    // { id: 1, name: "Weekend Squad", members: 5, lastActive: "2024-03-20" },
    // { id: 2, name: "Roommates", members: 3, lastActive: "2024-03-19" },
    // { id: 3, name: "Family", members: 4, lastActive: "2024-03-15" }
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader navigation={navigation} />
        
        <BalanceSummary balance={balance} />
        
        <FriendsSummary navigation={navigation} friends={friends} />
        
        <GroupsList groups={groups} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: profileTheme.colors.gray[50],
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: profileTheme.spacing.md,
    gap: profileTheme.spacing.xl,
  },
});

export default ProfileScreen;