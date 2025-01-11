// src/screens/ProfileScreen.jsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { profileTheme } from '../../theme';

import ProfileHeader from '../../components/profile/ProfileHeader';
import RecentActivities from '../../components/profile/RecentActivities';
import FriendsSummary from '../../components/profile/FriendsSummary';
import GroupsList from '../../components/profile/GroupsList';

const ProfileScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader navigation={navigation} />
        
        {/* <RecentActivities navigation={navigation} /> */}
        
        <FriendsSummary navigation={navigation} />
        
        <GroupsList />
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