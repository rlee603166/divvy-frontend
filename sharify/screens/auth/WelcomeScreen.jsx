import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import theme from "../../theme";

const WelcomeScreen = ({ navigation }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    return (
        <ImageBackground
            source={require('../../assets/image.jpg')} // Add your image in the assets folder
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.contentContainer}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.brandText}>Sharify</Text>

                    <Text style={styles.descriptionText}>
                        Easily split bills, track expenses, and settle payments with your group.
                        Simplify sharing and get back to what matters.
                    </Text>
                </View>

                <View style={styles.flex} />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate("Auth", { screen: "Login" })}
                    >
                        <Text style={styles.loginText}>Log in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={() => navigation.navigate("Auth", { screen: "Sign" })}
                    >
                        <Text style={styles.signupText}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    container: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Slight overlay for readability
    },
    spacer: {
        height: 80,
    },
    contentContainer: {
        alignItems: "center",
        gap: 16,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "600",
        color: "#000",
    },
    brandText: {
        fontSize: 34,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    descriptionText: {
        fontSize: 16,
        color: "#333", // Darker for better contrast
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    flex: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    loginButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(128, 128, 128, 0)",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)", // Slight background for visibility
    },
    loginText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    signupButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    signupText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
});

export default WelcomeScreen;