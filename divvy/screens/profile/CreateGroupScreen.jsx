// screens/profile/CreateGroupScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { X, Check, Users, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { friendTheme } from '../../theme';
import { useFriends } from '../../hooks/useFriends';
import { useGroups } from '../../context/GroupsContext';

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const { friends } = useFriends();
  const { createGroup } = useGroups();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to add a group picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setGroupImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove the group image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setGroupImage(null),
        },
      ]
    );
  };

  const handleCreateGroup = () => {
    if (createGroup(groupName, selectedFriends, groupImage)) {
      navigation.goBack();
    }
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => 
      prev.includes(friend)
        ? prev.filter(f => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const isSelected = (friend) => selectedFriends.includes(friend);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Group</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <X width={24} height={24} color={friendTheme.colors.gray600} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={styles.groupImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Users width={40} height={40} color={friendTheme.colors.gray400} />
                </View>
              )}
              <Text style={styles.changePhotoText}>
                {groupImage ? 'Change Group Photo' : 'Add Group Photo'}
              </Text>
            </TouchableOpacity>
            {groupImage && (
              <TouchableOpacity 
                style={styles.removePhotoButton} 
                onPress={removeImage}
              >
                <Trash2 size={16} color={friendTheme.colors.red500} />
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Group Name</Text>
            <TextInput
              style={styles.nameInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor={friendTheme.colors.gray400}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Select Friends</Text>
          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => toggleFriendSelection(friend)}
              >
                <View style={styles.leftContainer}>
                  <Image
                    source={{ uri: friend.avatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendUsername}>{friend.username}</Text>
                  </View>
                </View>
                {isSelected(friend) ? (
                  <View style={styles.selectedButton}>
                    <Check width={20} height={20} color={friendTheme.colors.primary} />
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                ) : (
                  <View style={styles.selectButton}>
                    <Text style={styles.selectButtonText}>Select</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!groupName.trim() || selectedFriends.length === 0) && styles.createButtonDisabled
            ]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || selectedFriends.length === 0}
          >
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: friendTheme.colors.white,
  },
  container: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: friendTheme.spacing[6],
  },
  imageContainer: {
    alignItems: 'center',
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: friendTheme.spacing[3],
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: friendTheme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: friendTheme.spacing[3],
  },
  changePhotoText: {
    color: friendTheme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: friendTheme.spacing[2],
    padding: friendTheme.spacing[2],
  },
  removePhotoText: {
    color: friendTheme.colors.red500,
    marginLeft: friendTheme.spacing[2],
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: friendTheme.spacing[4],
    paddingBottom: friendTheme.spacing[4],
  },
  sectionLabel: {
    fontSize: 14,
    color: friendTheme.colors.gray500,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 16,
    color: friendTheme.colors.gray900,
    fontWeight: '500',
    paddingVertical: friendTheme.spacing[2],
  },
  divider: {
    height: 8,
    backgroundColor: friendTheme.colors.gray50,
    marginBottom: friendTheme.spacing[4],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: friendTheme.colors.gray500,
    marginBottom: friendTheme.spacing[4],
    paddingHorizontal: friendTheme.spacing[4],
  },
  friendsList: {
    paddingHorizontal: friendTheme.spacing[4],
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: friendTheme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: friendTheme.colors.gray50,
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: friendTheme.colors.gray900,
  },
  friendUsername: {
    fontSize: 14,
    color: friendTheme.colors.gray500,
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: friendTheme.colors.indigo50,
    paddingHorizontal: friendTheme.spacing[4],
    paddingVertical: friendTheme.spacing[2],
    borderRadius: 16,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: friendTheme.colors.primary,
  },
  selectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: friendTheme.colors.green50,
    paddingHorizontal: friendTheme.spacing[4],
    paddingVertical: friendTheme.spacing[2],
    borderRadius: 16,
    gap: friendTheme.spacing[2],
  },
  selectedText: {
    fontSize: 14,
    fontWeight: "500",
    color: friendTheme.colors.green600,
  },
  footer: {
    padding: friendTheme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: friendTheme.colors.gray50,
  },
  createButton: {
    backgroundColor: friendTheme.colors.primary,
    padding: friendTheme.spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: friendTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupScreen;