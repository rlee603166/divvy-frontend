import React, { useState, useCallback, useEffect } from "react";
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
    SafeAreaView,
} from "react-native";
import theme from "../../theme";

const AdditionalCharges = ({ navigation, route }) => {

    const { onSubmit, additionalCharges } = route.params;

    const [tax, setTax] = useState(additionalCharges?.tax?.toString() || null);
    const [tip, setTip] = useState(additionalCharges?.tip?.toString() || null);
    const [misc, setMisc] = useState(additionalCharges?.misc?.toString() || null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (additionalCharges) {
            setTax(additionalCharges.tax?.toString() || null);
            setTip(additionalCharges.tip?.toString() || null);
            setMisc(additionalCharges.misc?.toString() || null);
        }
    }, [additionalCharges]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubmit = () => {
        const data = {
            tax: Number(tax) ?? 0,
            tip: Number(tip) ?? 0,
            misc: Number(misc) ?? 0,
        };

        onSubmit(data);
        navigation.goBack();
    };

    const handleTaxChange = useCallback(text => {
        setTax(text);
        setErrorMessage(null);
    }, []);

    const handleTipChange = useCallback(text => {
        setTip(text);
        setErrorMessage(null);
    }, []);

    const handleMiscChange = useCallback(text => {
        setMisc(text);
        setErrorMessage(null);
    }, []);

    // const onPress = useCallback(async () => {
    //     if (!tax.trim()) return;
    //
    //     setErrorMessage(null);
    //
    //     try {
    //         await onSubmit(tax);
    //     } catch (error) {
    //         setErrorMessage(error.message || "An error occurred");
    //     }
    // }, [tax, onSubmit]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Add any extra charges:</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Tax:</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[
                                        styles.phoneInput,
                                        Platform.OS === "ios" && styles.iosInput,
                                    ]}
                                    value={tax}
                                    onChangeText={handleTaxChange}
                                    keyboardType="numeric"
                                    placeholder="Tax"
                                    placeholderTextColor="#999"
                                    maxLength={50}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    enablesReturnKeyAutomatically
                                    clearButtonMode="while-editing"
                                    blurOnSubmit={true}
                                    underlineColorAndroid="transparent"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Tip:</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[
                                        styles.phoneInput,
                                        Platform.OS === "ios" && styles.iosInput,
                                    ]}
                                    value={tip}
                                    onChangeText={handleTipChange}
                                    keyboardType="numeric"
                                    placeholder="Tip, Gratuity"
                                    placeholderTextColor="#999"
                                    maxLength={50}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    enablesReturnKeyAutomatically
                                    clearButtonMode="while-editing"
                                    blurOnSubmit={true}
                                    underlineColorAndroid="transparent"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Misc:</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[
                                        styles.phoneInput,
                                        Platform.OS === "ios" && styles.iosInput,
                                    ]}
                                    value={misc}
                                    onChangeText={handleMiscChange}
                                    keyboardType="numeric"
                                    placeholder="ex: Credit Card, Delivery Fees, etc."
                                    placeholderTextColor="#999"
                                    maxLength={50}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    enablesReturnKeyAutomatically
                                    clearButtonMode="while-editing"
                                    blurOnSubmit={true}
                                    underlineColorAndroid="transparent"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonEnabled]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Done</Text>
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
        backgroundColor: "white",
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    inputContainer: {
        flex: 1,
        flexDirextion: "row",
        justifyContent: "flex-start",
        paddingVertical: 20,
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginTop: 24,
        marginHorizontal: 24,
    },
    title2: {
        fontSize: 20,
        fontWeight: "600",
    },
    inputWrapper: {
        paddingBottom: 8,
    },
    phoneInput: {
        fontSize: 20,
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
        paddingBottom: 35,
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
    closeButton: {
        paddingTop: 4,
        paddingHorizontal: 4,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: "300",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
});

export default React.memo(AdditionalCharges);
