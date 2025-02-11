import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import theme from "../../theme/index";
import UserService from "../../services/UserService";

const PhoneInputView = ({ onNext }) => {
    const [countryCode, setCountryCode] = useState("1");
    const [rawPhoneNumber, setRawPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const phoneInputRef = useRef(null);
    const countryCodeInputRef = useRef(null);

    const userService = new UserService();

    const formatPhoneNumber = text => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";

        if (cleaned.length > 0) {
            formatted += "(" + cleaned.slice(0, 3);
            if (cleaned.length > 3) {
                formatted += ") " + cleaned.slice(3, 6);
                if (cleaned.length > 6) {
                    formatted += "-" + cleaned.slice(6, 10);
                }
            }
        }
        return formatted;
    };

    const handleCountryCodeChange = text => {
        const cleaned = text.replace(/\D/g, "");
        setCountryCode(cleaned.slice(0, 1));
        if (cleaned.length === 1) {
            phoneInputRef.current?.focus();
        }
    };

    const handlePhoneChange = text => {
        const cleaned = text.replace(/\D/g, "");
        if (cleaned.length <= 10) {
            setRawPhoneNumber(cleaned);

            const fullPhone = countryCode + " " + formatPhoneNumber(cleaned);
        }

        if (text.length === 0) {
            countryCodeInputRef.current?.focus();
        }
    };

    const checkPhoneAndProceed = async () => {
        setIsChecking(true);
        setErrorMessage(null);

        try {
            const formattedPhone = `+${countryCode}${rawPhoneNumber}`;
            // const isAvailable = await PhoneService.checkAvailability(formattedPhone);
            const response = await userService.getSMS(rawPhoneNumber);

            if (response.status === "pending") {
                onNext(rawPhoneNumber);
            } else if (response.status === "user already exists") {
                setErrorMessage("This phone number is already registered.");
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        } catch (error) {
            if (error.code === "number_registered") {
                setErrorMessage("This phone number is already registered");
            } else if (error.code === "verification_failed") {
                setErrorMessage(`Failed to send verification code: ${error.message}`);
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Enter your phone</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.prefix}>+</Text>

                        <TextInput
                            ref={countryCodeInputRef}
                            style={styles.countryInput}
                            value={countryCode}
                            onChangeText={handleCountryCodeChange}
                            keyboardType="number-pad"
                            maxLength={1}
                        />

                        <TextInput
                            ref={phoneInputRef}
                            style={styles.phoneInput}
                            value={formatPhoneNumber(rawPhoneNumber)}
                            onChangeText={handlePhoneChange}
                            placeholder="Mobile Number"
                            keyboardType="number-pad"
                            maxLength={14}
                        />
                    </View>
                </View>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor:
                                    rawPhoneNumber.length === 10 && !isChecking
                                        ? theme.colors.primary
                                        : "#999999",
                            },
                        ]}
                        onPress={checkPhoneAndProceed}
                        disabled={rawPhoneNumber.length !== 10 || isChecking}
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
        justifyContent: "space-between",
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    prefix: {
        fontSize: 24,
        color: "#666666",
        marginRight: 2,
        marginBottom: 8,
    },
    countryInput: {
        fontSize: 24,
        width: 40,
        paddingBottom: 8,
        marginLeft: 2,
        marginRight: 4,
    },
    phoneInput: {
        flex: 1,
        fontSize: 24,
        paddingBottom: 8,
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 8,
    },
    buttonContainer: {
        paddingHorizontal: 0,
        paddingBottom: 55,
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

export default PhoneInputView;
