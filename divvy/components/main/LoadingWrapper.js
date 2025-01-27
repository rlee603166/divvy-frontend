import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ActivityIndicator } from "react-native";
import theme from "../../theme/index";

const LoadingWrapper = ({ children, isLoading, backgroundColor = "#ffffff" }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.98)).current;

    useEffect(() => {
        if (isLoading) {
            // Reset animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.98);

            // Start fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();

            // Start subtle scale animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.02,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.98,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isLoading, fadeAnim, scaleAnim]);

    if (!isLoading) return children;

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {children}
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <View style={styles.backdrop} />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(8px)",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    loadingCard: {
        padding: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 16,
    },
});

export default LoadingWrapper;
