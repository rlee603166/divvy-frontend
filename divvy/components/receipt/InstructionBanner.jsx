import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import theme from '../../theme';

const InstructionBanner = ({ selectedUser }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (selectedUser) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    delay: 1500,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [selectedUser]);

    if (!selectedUser) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.content}>
                <Info size={16} color={theme.colors.primary} />
                <Text style={styles.text}>
                    Tap on an item to assign to {selectedUser === 'everyone' ? 'everyone' : 'this person'}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: -4,  // Adjust to overlap with the content area slightly
      left: 16,
      right: 16,
      zIndex: 100,
      alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 8,
    },
    text: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default InstructionBanner;