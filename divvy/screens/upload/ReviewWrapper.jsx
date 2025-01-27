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
    Alert,
} from "react-native";
import ReviewScreen from "../../components/receipt/ReviewScreen";
import ReceiptService from "../../services/ReceiptService";
import ReceiptProcessor, { formatForAPI } from "../../services/ReceiptProcessor";
import theme from "../../theme";

const SUBMIT_THRESHOLD = -200;
const VELOCITY_THRESHOLD = -800;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DRAG_THRESHOLD = 5;

const ReviewWrapper = ({ setStep, processed, receiptID, peopleHashMap }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const translateY = useRef(new Animated.Value(0)).current;
    const dragStart = useRef(0);
    const isFirstDrag = useRef(true);
    const confirmationScale = useRef(new Animated.Value(0)).current;
    const confirmationOpacity = useRef(new Animated.Value(0)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const checkmarkStroke = useRef(new Animated.Value(0)).current;

    const receiptService = new ReceiptService();

    useEffect(() => {
        translateY.setValue(0);
        confirmationScale.setValue(0);
        confirmationOpacity.setValue(0);
        checkmarkScale.setValue(0);
        checkmarkStroke.setValue(0);

        return () => {
            translateY.setValue(0);
            confirmationScale.setValue(0);
            confirmationOpacity.setValue(0);
            checkmarkScale.setValue(0);
            checkmarkStroke.setValue(0);
        };
    }, []);

    const handleError = (errorMessage) => {
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
            })
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

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
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
                if (gestureState.dy < 0) {
                    const resistance = isFirstDrag.current ? 1 : 0.7;
                    const value = gestureState.dy * resistance;
                    translateY.setValue(value);
                }
            },
            onPanResponderRelease: async (_, gestureState) => {
                translateY.flattenOffset();
                setIsDragging(false);

                if (gestureState.dy < SUBMIT_THRESHOLD || gestureState.vy < VELOCITY_THRESHOLD) {
                    confirmationScale.setValue(0);
                    confirmationOpacity.setValue(0);
                    checkmarkScale.setValue(0);
                    checkmarkStroke.setValue(0);

                    Animated.spring(translateY, {
                        toValue: -SCREEN_HEIGHT,
                        useNativeDriver: true,
                        stiffness: 200,
                        damping: 25,
                        mass: 1,
                    }).start(async () => {
                        try {
                            const apiFormatted = formatForAPI(processed, receiptID);
                            console.log(JSON.stringify(apiFormatted, null, 2));
                            const success = await receiptService.queueVenmoRequests(apiFormatted);

                            if (success) {
                                await handleSuccess();
                            } else {
                                handleError("Failed to send requests. Please try again.");
                            }
                        } catch (err) {
                            handleError(err.message || "An unexpected error occurred");
                        }
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

    return (
        <View style={styles.rootContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.primary} />
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.background} />
            </View>

            {error && (
                <Animated.View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}

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
                    {...panResponder.panHandlers}
                >
                    <ReviewScreen
                        isDragging={isDragging}
                        processed={processed}
                        setStep={setStep}
                        peopleHashMap={peopleHashMap}
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
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 10,
        left: 20,
        right: 20,
        backgroundColor: '#ff3b30',
        padding: 10,
        borderRadius: 8,
        zIndex: 1000,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default ReviewWrapper;
