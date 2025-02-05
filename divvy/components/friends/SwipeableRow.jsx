// components/friends/SwipeableRow.js
import { useState, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { friendTheme } from '../../theme';

const SwipeableRow = ({ children, onDelete }) => {
  const [rowTranslation] = useState(new Animated.Value(0));
  const [isOpen, setIsOpen] = useState(false);
  const initialThreshold = -120;  // First threshold to show delete
  const deleteThreshold = -170;  // Second threshold to trigger delete
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        return Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (_, { dx }) => {
        const newX = Math.min(0, Math.max(dx, deleteThreshold));
        rowTranslation.setValue(newX);
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx < deleteThreshold / 1.2) {
          onDelete();
          resetPosition();
        } else if (dx < initialThreshold / 2) {
          // Snap to initial threshold
          Animated.spring(rowTranslation, {
            toValue: initialThreshold,
            useNativeDriver: false,
            bounciness: 0,
          }).start(() => setIsOpen(true));
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(rowTranslation, {
      toValue: 0,
      useNativeDriver: false,
    }).start(() => setIsOpen(false));
  };

  const translateX = rowTranslation.interpolate({
    inputRange: [deleteThreshold, 0],
    outputRange: [deleteThreshold, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = rowTranslation.interpolate({
    inputRange: [deleteThreshold, initialThreshold, 0],
    outputRange: [
      friendTheme.colors.red700,
      friendTheme.colors.red500,
      friendTheme.colors.red500
    ],
    extrapolate: 'clamp',
  });

  const deleteTextOpacity = rowTranslation.interpolate({
    inputRange: [deleteThreshold, initialThreshold],
    outputRange: [1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={resetPosition}
      >
        <TouchableWithoutFeedback onPress={resetPosition}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Modal>

      <Animated.View style={[styles.container, { backgroundColor }]}>
        {/* Background Content */}
        <View style={styles.backgroundContainer}>
          {/* Delete button content */}
          <Animated.View 
            style={[
              styles.deleteContainer,
              { opacity: deleteTextOpacity }
            ]}
          >
            <Trash2 width={24} height={24} color={friendTheme.colors.white} />
            <Text style={styles.deleteText}>Remove</Text>
          </Animated.View>
        </View>

        {/* Main Content */}
        <Animated.View
          style={[styles.mainContent, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: friendTheme.spacing[2],
    overflow: 'hidden',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteContainer: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    color: friendTheme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  mainContent: {
    backgroundColor: friendTheme.colors.white,
  },
});

export default SwipeableRow;
