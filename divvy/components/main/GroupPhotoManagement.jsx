
// src/components/main/GroupPhotoManagement.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Users } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGroups } from '../context/GroupsContext';

const GroupPhotoManagement = ({ groupId, theme }) => {
  const { getGroupById, updateGroupImage, removeGroupImage } = useGroups();
  const group = getGroupById(groupId);
  const [localGroupImage, setLocalGroupImage] = useState(group?.groupImage);
  
  useEffect(() => {
    setLocalGroupImage(group?.groupImage);
  }, [group?.groupImage]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to change the group picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setLocalGroupImage(imageUri);
        updateGroupImage(groupId, imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleRemoveImage = useCallback(() => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove the group photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setLocalGroupImage(null);
            removeGroupImage(groupId);
          }
        }
      ]
    );
  }, [groupId, removeGroupImage]);

  if (!group) return null;

  return (
    <View style={styles.imageContainer}>
      <TouchableOpacity 
        style={styles.imageSection}
        onPress={pickImage}
        activeOpacity={0.7}
      >
        {localGroupImage ? (
          <Image
            source={{ uri: localGroupImage }}
            style={styles.groupImage}
          />
        ) : (
          <View style={[styles.groupImagePlaceholder, { backgroundColor: theme.colors.gray100 }]}>
            <Users width={40} height={40} color={theme.colors.gray400} />
          </View>
        )}
      </TouchableOpacity>
      
      {localGroupImage && (
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
          onPress={handleRemoveImage}
          activeOpacity={0.7}
        >
          <Text style={styles.removeButtonText}>Remove Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  groupImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GroupPhotoManagement;