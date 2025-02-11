import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Animated,
    PanResponder,
    Dimensions,
    StyleSheet,
    Platform,
    StatusBar,
    TouchableOpacity,
    Linking,
} from "react-native";
import ReviewScreen from "../../components/receipt/ReviewScreen";
import ReceiptService from "../../services/ReceiptService";
import ReceiptProcessor, { generateGroupMessage } from "../../services/ReceiptProcessor";
import { useUser } from "../../services/UserProvider"; // Adjust the path as needed
import { Share } from "lucide-react-native";
import theme from "../../theme";

import StatusOverlay from "../../components/upload/StatusOverlay";

const SUBMIT_THRESHOLD = -200;
const VELOCITY_THRESHOLD = -800;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAG_THRESHOLD = 5;

const ReviewWrapper = ({ setStep, processed, receiptID, peopleHashMap }) => {
    const { phone: currentUserPhone, username, id } = useUser();

    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showShareButton, setShowShareButton] = useState(false);
    // New state for submission status message
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const translateY = useRef(new Animated.Value(0)).current;
    const dragStart = useRef(0);
    const isFirstDrag = useRef(true);
    const confirmationScale = useRef(new Animated.Value(0)).current;
    const confirmationOpacity = useRef(new Animated.Value(0)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const checkmarkStroke = useRef(new Animated.Value(0)).current;

    const receiptService = new ReceiptService();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 50);


        return () => {
            clearTimeout(timer);
            translateY.setValue(0);
            confirmationScale.setValue(0);
            confirmationOpacity.setValue(0);
            checkmarkScale.setValue(0);
            checkmarkStroke.setValue(0);
        };
    }, []);

    const handleError = errorMessage => {
        setError(errorMessage);
        Animated.sequence([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                stiffness: 200,
                damping: 25,
                mass: 1,
            }),
            Animated.delay(2000),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setError(null);
        });
    };

    const handleSuccess = async () => {
        Animated.parallel([
            Animated.sequence([
                Animated.spring(confirmationScale, {
                    toValue: 1.2,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 5,
                }),
                Animated.spring(confirmationScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 5,
                }),
            ]),
            Animated.timing(confirmationOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(200),
                Animated.timing(checkmarkStroke, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(checkmarkScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 3,
                }),
            ]),
        ]).start();

        await new Promise(resolve => setTimeout(resolve, 1600));

        Animated.timing(confirmationOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setStep(0);
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleShareMessage = async () => {
        try {
            console.log("Full peopleHashMap:", peopleHashMap);

            // Extract, filter, and format phone numbers while excluding the current user's phone.
            const phoneNumbers = Object.values(peopleHashMap)
                .filter(person => {
                    let phone =
                        person.phone ||
                        (person.phoneNumbers && person.phoneNumbers[0]?.number) ||
                        "";
                    if (!phone) {
                        console.log("No phone number found for:", person.name);
                        return false;
                    }
                    // Remove non-numeric characters.
                    const cleanPhone = phone.replace(/\D/g, "");
                    if (currentUserPhone) {
                        const cleanCurrent = currentUserPhone.replace(/\D/g, "");
                        // Exclude if they match either directly or after adding a country code.
                        if (
                            cleanPhone === cleanCurrent ||
                            (cleanPhone.length === 10 && "1" + cleanPhone === cleanCurrent)
                        ) {
                            console.log("Excluding current user's phone:", phone);
                            return false;
                        }
                    }
                    return true;
                })
                .map(person => {
                    let phone =
                        person.phone ||
                        (person.phoneNumbers && person.phoneNumbers[0]?.number) ||
                        "";
                    const cleanPhone = phone.replace(/\D/g, "");
                    let formattedPhone = cleanPhone;
                    if (cleanPhone.length === 10) {
                        formattedPhone = "1" + cleanPhone;
                    }
                    return formattedPhone;
                })
                .filter(phone => phone && phone.length >= 10);

            console.log("Final filtered phone numbers:", phoneNumbers);

            if (phoneNumbers.length === 0) {
                handleError("No valid phone numbers found");
                return;
            }


        
            const message = generateGroupMessage(id, processed, username);
            let smsUri = "";

            if (Platform.OS === "ios") {
                if (phoneNumbers.length > 1) {
                    // For iOS with multiple recipients, use the "addresses" query parameter.
                    smsUri = `sms:?addresses=${phoneNumbers.join(
                        ","
                    )}&body=${encodeURIComponent(message)}`;
                } else {
                    smsUri = `sms:${phoneNumbers[0]}?body=${encodeURIComponent(message)}`;
                }
            } else {
                // Android: use semicolon separated recipients.
                smsUri = `smsto:${phoneNumbers.join(";")}?body=${encodeURIComponent(message)}`;
            }

            console.log("Final SMS URI:", smsUri);

            const canOpen = await Linking.canOpenURL(smsUri);
            if (canOpen) {
                await Linking.openURL(smsUri);
                // Once the messaging app is opened, reset to camera screen
                setSubmissionStatus(null);
                setStep(0);
                return;
            } else {
                // Fallback: try opening without the message body.
                const fallbackUri =
                    Platform.OS === "ios"
                        ? phoneNumbers.length > 1
                            ? `sms:?addresses=${phoneNumbers.join(",")}`
                            : `sms:${phoneNumbers[0]}`
                        : `smsto:${phoneNumbers.join(";")}`;
                console.log("Fallback SMS URI:", fallbackUri);
                if (await Linking.canOpenURL(fallbackUri)) {
                    await Linking.openURL(fallbackUri);
                    setSubmissionStatus(null);
                    setStep(0);
                    return;
                } else {
                    handleError("Cannot open messaging app");
                }
            }
        } catch (err) {
            handleError("Failed to open messaging app");
            console.error("Share message error:", err);
        } finally {
            // Ensure the submission message is cleared if not already done
            setSubmissionStatus(null);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                if (modalVisible) return false;

                const touchY = evt.nativeEvent.pageY;
                const windowHeight = Dimensions.get("window").height;
                const dragArea = windowHeight - 220;

                return (
                    touchY > dragArea &&
                    Math.abs(gestureState.dy) > DRAG_THRESHOLD &&
                    Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
                );
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                if (modalVisible) return false;

                const touchY = evt.nativeEvent.pageY;
                const windowHeight = Dimensions.get("window").height;
                const dragArea = windowHeight - 220;

                return (
                    touchY > dragArea &&
                    Math.abs(gestureState.dy) > DRAG_THRESHOLD &&
                    Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
                );
            },
            onPanResponderGrant: evt => {
                if (modalVisible) return;

                setIsDragging(true);
                dragStart.current = evt.nativeEvent.pageY;

                if (isFirstDrag.current) {
                    translateY.setValue(0);
                    isFirstDrag.current = false;
                } else {
                    translateY.setOffset(translateY._value);
                    translateY.setValue(0);
                }
            },
            onPanResponderMove: (_, gestureState) => {
                if (modalVisible) return;

                if (gestureState.dy < 0) {
                    const resistance = isFirstDrag.current ? 1 : 0.7;
                    const value = gestureState.dy * resistance;
                    translateY.setValue(value);
                }
            },
            onPanResponderRelease: async (_, gestureState) => {
                if (modalVisible) return;

                translateY.flattenOffset();
                setIsDragging(false);

                if (gestureState.dy < SUBMIT_THRESHOLD || gestureState.vy < VELOCITY_THRESHOLD) {
                    // Reset any confirmation animations
                    confirmationScale.setValue(0);
                    confirmationOpacity.setValue(0);
                    checkmarkScale.setValue(0);
                    checkmarkStroke.setValue(0);

                    // Set the submission status message
                    setSubmissionStatus("Processing request...");

                    Animated.spring(translateY, {
                        toValue: -SCREEN_HEIGHT,
                        useNativeDriver: true,
                        stiffness: 200,
                        damping: 25,
                        mass: 1,
                    }).start(() => {
                        // Trigger the sharing process
                        handleShareMessage();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        stiffness: 200,
                        damping: 25,
                        mass: 1,
                    }).start();
                }
            },
            onPanResponderTerminate: () => {
                if (modalVisible) return;

                setIsDragging(false);
                translateY.setOffset(0);
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    stiffness: 200,
                    damping: 25,
                    mass: 1,
                }).start();
            },
        })
    ).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 50);

        return () => {
            clearTimeout(timer);
            translateY.setValue(0);
            confirmationScale.setValue(0);
            confirmationOpacity.setValue(0);
            checkmarkScale.setValue(0);
            checkmarkStroke.setValue(0);
        };
    }, []);

    // Return nothing until the component is ready.
    if (!isReady) {
        return null;
    }

    return (
        <View style={[styles.rootContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.primary} />

            <View style={StyleSheet.absoluteFill}>
                <View style={styles.background} />
            </View>

            {error && (
                <Animated.View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}

            {submissionStatus && <StatusOverlay submissionStatus={submissionStatus} />}

            <View style={styles.innerContainer}>
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            transform: [
                                {
                                    translateY: translateY.interpolate({
                                        inputRange: [-SCREEN_HEIGHT, 0],
                                        outputRange: [-SCREEN_HEIGHT, 0],
                                        extrapolate: "clamp",
                                    }),
                                },
                            ],
                        },
                    ]}
                    {...(modalVisible ? {} : panResponder.panHandlers)}
                >
                    <ReviewScreen
                        isDragging={isDragging}
                        processed={processed}
                        setStep={setStep}
                        peopleHashMap={peopleHashMap}
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                    />
                </Animated.View>

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.confirmationContainer,
                        {
                            opacity: confirmationOpacity,
                            transform: [{ scale: confirmationScale }],
                        },
                    ]}
                >
                    <View style={styles.confirmationCircle}>
                        <Animated.View
                            style={[
                                styles.checkmark,
                                {
                                    opacity: checkmarkStroke,
                                    transform: [
                                        { scale: checkmarkScale },
                                        {
                                            scale: checkmarkStroke.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.8, 1],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.checkmarkStem} />
                            <View style={styles.checkmarkKick} />
                        </Animated.View>
                    </View>
                    <Animated.Text
                        style={[
                            styles.confirmationText,
                            {
                                opacity: checkmarkStroke,
                                transform: [
                                    {
                                        translateY: checkmarkStroke.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [10, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        Requests Sent Successfully!
                    </Animated.Text>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    hidden: {
        opacity: 0,
    },
    background: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    contentContainer: {
        flex: 1,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: "hidden",
        backgroundColor: theme.colors.primary,
    },
    confirmationContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        zIndex: 1000,
    },
    confirmationCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    checkmark: {
        width: 32,
        height: 32,
        position: "relative",
    },
    checkmarkStem: {
        position: "absolute",
        width: 3,
        height: 18,
        backgroundColor: theme.colors.primary,
        bottom: 6,
        left: 16,
        borderRadius: 2,
        transform: [{ rotate: "45deg" }],
    },
    checkmarkKick: {
        position: "absolute",
        width: 3,
        height: 10,
        backgroundColor: theme.colors.primary,
        bottom: 9,
        left: 8,
        borderRadius: 2,
        transform: [{ rotate: "-45deg" }],
    },
    confirmationText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 8,
    },
    errorContainer: {
        position: "absolute",
        top: Platform.OS === "ios" ? 40 : StatusBar.currentHeight + 10,
        left: 20,
        right: 20,
        backgroundColor: "#ff3b30",
        padding: 10,
        borderRadius: 8,
        zIndex: 1000,
    },
    errorText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
    submissionOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1500,
    },
    submissionText: {
        color: "white",
        fontSize: 30,
        fontWeight: "600",
        textAlign: "center",
        padding: 10,
        borderRadius: 8,
    },
});

export default ReviewWrapper;
