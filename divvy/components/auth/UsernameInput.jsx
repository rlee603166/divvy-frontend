import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import theme from "../../theme";

const UsernameInput = ({ onSubmit, prompt, error }) => {
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const handleUsernameChange = useCallback(text => {
        setUsername(text);
        setErrorMessage(null);
    }, []);

    useEffect(() => {
        setErrorMessage(error);
    }, [error])

    const checkUserAndProceed = useCallback(async () => {
        if (!username.trim()) return;

        setIsChecking(true);
        setErrorMessage(null);

        try {
            await onSubmit(username);
        } catch (error) {
            setErrorMessage(error.message || "An error occurred");
        } finally {
            setIsChecking(false);
        }
    }, [username, onSubmit]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{prompt}</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[
                                    styles.phoneInput,
                                    Platform.OS === "ios" && styles.iosInput,
                                ]}
                                value={username}
                                onChangeText={handleUsernameChange}
                                keyboardType="default"
                                placeholder="Username"
                                placeholderTextColor="#999"
                                maxLength={50}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                                enablesReturnKeyAutomatically
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                blurOnSubmit={true}
                                underlineColorAndroid="transparent"
                                onSubmitEditing={checkUserAndProceed}
                            />
                        </View>
                        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isChecking ? styles.buttonDisabled : styles.buttonEnabled,
                            ]}
                            onPress={checkUserAndProceed}
                            disabled={isChecking || username.length === 0}
                        >
                            <Text style={styles.buttonText}>
                                {isChecking ? "Checking..." : "Next"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    contentContainer: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 24,
    },
    inputWrapper: {
        paddingBottom: 8,
    },
    phoneInput: {
        fontSize: 24,
        color: "#000",
        height: Platform.OS === "ios" ? 48 : 56, // Adjusted height for iOS
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
    },
    iosInput: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    error: {
        color: "red",
        fontSize: 14,
        marginTop: 8,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    button: {
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonEnabled: {
        backgroundColor: theme.colors.primary,
    },
    buttonDisabled: {
        backgroundColor: "#666",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default React.memo(UsernameInput);
