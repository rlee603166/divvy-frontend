import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import theme from "../../theme";

const SMSVerificationView = ({ phone, onNext, initialCode = "", setStep }) => {
    const [code, setCode] = useState(initialCode);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    const handleCodeChange = text => {
        const numericCode = text.replace(/[^0-9]/g, "").slice(0, 6);
        setCode(numericCode);
    };

    const checkCode = async () => {
        setIsChecking(true);
        setErrorMessage(null);

        try {
            const data = await onNext(code);
            if (data.status === "denied") {
                setErrorMessage("Invalid code. Please try again.");
                return;
            }

            setErrorMessage(null);
            setStep(2);
        } catch (error) {
            setIsChecking(false);
       } finally {
       }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Enter verification code sent to {phone}</Text>

                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={code}
                    placeholder="012345"
                    onChangeText={handleCodeChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus={true}
                />

                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            isChecking ? styles.buttonDisabled : styles.buttonEnabled,
                        ]}
                        onPress={checkCode}
                        disabled={isChecking || code.length === 0}
                    >
                        <Text style={styles.buttonText}>{isChecking ? "Checking..." : "Next"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 24,
    },
    input: {
        fontSize: 24,
        fontWeight: "600",
        paddingVertical: 12,
    },
    errorText: {
        color: "red",
        marginTop: 8,
    },
    spacer: {
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 0,
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

export default SMSVerificationView;
