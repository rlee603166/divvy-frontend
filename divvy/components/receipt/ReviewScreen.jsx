import React, { useState, useRef, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Animated,
    Platform,
    StatusBar,
    Easing,
} from "react-native";
import theme from "../../theme";

const calculateTotals = data => {
    if (!data || typeof data !== "object") {
        return { subtotal: 0, tax: 0, tip: 0, misc: 0, total: 0 };
    }

    const subtotal = Object.entries(data)
        .filter(([key]) => !["tax", "tip", "misc"].includes(key))
        .reduce((sum, [_, person]) => {
            const personSubtotal = person?.subtotal || 0;
            return sum + personSubtotal;
        }, 0);

    const tax = data.tax || 0;
    const tip = data.tip || 0;
    const misc = data.misc || 0;
    const total = subtotal + tax + tip + misc;
    return { subtotal, tax, tip, misc, total };
};

const AnimatedSwipeText = ({ isDragging, style }) => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: isDragging ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isDragging]);

    return (
        <Animated.Text style={[styles.swipeText, style, { opacity }]}>
            Swipe up to Submit
        </Animated.Text>
    );
};

const ReviewScreen = ({ isDragging, processed, setStep, peopleHashMap }) => {
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({});
    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        tip: 0,
        misc: 0,
        total: 0,
    });

    const slideAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startBounceAnimation = () => {
            Animated.sequence([
                Animated.delay(2000),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(bounceAnim, {
                            toValue: -10,
                            duration: 350,
                            useNativeDriver: true,
                            easing: Easing.out(Easing.cubic),
                        }),
                        Animated.timing(bounceAnim, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: true,
                            easing: Easing.in(Easing.cubic),
                        }),
                        Animated.timing(bounceAnim, {
                            toValue: -10,
                            duration: 350,
                            useNativeDriver: true,
                            easing: Easing.out(Easing.cubic),
                        }),
                        Animated.timing(bounceAnim, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: true,
                            easing: Easing.in(Easing.cubic),
                        }),
                        Animated.delay(2000),
                    ])
                ),
            ]).start();
        };

        startBounceAnimation();
    }, []);

    useEffect(() => {
        if (processed && Object.keys(processed).length > 0) {
            setData(processed);
            const calculatedTotals = calculateTotals(processed);
            setTotals(calculatedTotals);
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [processed]);

    const handlePersonPress = name => {
        if (!data[name]) return;

        setSelectedPerson(data[name]);
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const formatNumber = num => {
        return (num || 0).toFixed(2);
    };

    const handleCloseModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: Dimensions.get("window").height,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
            setSelectedPerson(null);
        });
    };

    if (!isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.rootContainer}>
            <View style={styles.container}>
                <View style={styles.spacer} />
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
                </TouchableOpacity>

                <Text style={styles.title}>Receipt Review</Text>

                <View style={styles.contentContainer}>
                    <Text style={styles.sectionTitleShares}>Individual Shares</Text>
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.section}>
                            {Object.keys(data)
                                .filter(key => !["tax", "tip", "misc"].includes(key))
                                .map(name => (
                                    <TouchableOpacity
                                        key={name}
                                        style={styles.shareCard}
                                        onPress={() => handlePersonPress(name)}
                                    >
                                        <Text style={styles.personName}>
                                            {data[name].name}
                                        </Text>
                                        <Text style={styles.amount}>
                                            ${formatNumber(data[name]?.finalTotal)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                        </View>
                    </ScrollView>

                    <View style={styles.summaryContainer}>
                        <View style={[styles.section, styles.summarySection]}>
                            <Text style={styles.sectionTitle}>Summary</Text>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryRow}>
                                    <Text>Subtotal</Text>
                                    <Text>${formatNumber(totals.subtotal)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text>Tax</Text>
                                    <Text>${formatNumber(totals.tax)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text>Tip</Text>
                                    <Text>${formatNumber(totals.tip)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text>Misc</Text>
                                    <Text>${formatNumber(totals.misc)}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.boldText}>Total</Text>
                                    <Text style={styles.boldText}>
                                        ${formatNumber(totals.total)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.dragHandle}>
                                <Animated.Text
                                    style={[
                                        styles.chevron,
                                        {
                                            transform: [{ translateY: bounceAnim }],
                                        },
                                    ]}
                                >
                                    ︿
                                </Animated.Text>
                                <AnimatedSwipeText
                                    isDragging={isDragging}
                                    style={styles.swipeText}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <Modal
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                    animationType="none"
                >
                    {selectedPerson && (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.modalContainer}
                            onPress={handleCloseModal}
                        >
                            <Animated.View
                                style={[
                                    styles.modalOverlay,
                                    {
                                        opacity: fadeAnim,
                                    },
                                ]}
                            />

                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={e => e.stopPropagation()}
                                    style={{ flex: 1 }}
                                >
                                    <View style={styles.modalHeader}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {selectedPerson.name?.[0] || ""}
                                            </Text>
                                        </View>
                                        <View style={styles.headerTextContainer}>
                                            <Text style={styles.headerTitle}>
                                                {selectedPerson.name}'s Share
                                            </Text>
                                            <Text style={styles.headerSubtitle}>Order Details</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleCloseModal}
                                            style={styles.closeButton}
                                        >
                                            <Text style={styles.closeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={styles.modalScroll}>
                                        <View style={styles.itemsContainer}>
                                            {(selectedPerson.items || []).map((item, index) => (
                                                <View key={index} style={styles.itemRow}>
                                                    <View style={styles.itemNameContainer}>
                                                        <Text style={styles.itemName}>
                                                            {item?.name || "Unknown Item"}
                                                        </Text>
                                                        {item?.users > 1 && (
                                                            <Text style={styles.splitText}>
                                                                Split {item.users} ways
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.itemPrice}>
                                                        $
                                                        {formatNumber(
                                                            (item?.price || 0) / (item?.users || 1)
                                                        )}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={styles.totalContainer}>
                                            <View style={styles.summaryRow}>
                                                <Text>Subtotal</Text>
                                                <Text>
                                                    ${formatNumber(selectedPerson.subtotal)}
                                                </Text>
                                            </View>
                                            <View style={styles.summaryRow}>
                                                <Text>Tax</Text>
                                                <Text>${formatNumber(selectedPerson.tax)}</Text>
                                            </View>
                                            <View style={styles.summaryRow}>
                                                <Text>Tip</Text>
                                                <Text>${formatNumber(selectedPerson.tip)}</Text>
                                            </View>
                                            <View style={styles.summaryRow}>
                                                <Text>Misc</Text>
                                                <Text>${formatNumber(selectedPerson.misc)}</Text>
                                            </View>
                                            <View style={styles.totalRow}>
                                                <Text style={styles.totalLabel}>Final Total</Text>
                                                <Text style={styles.totalAmount}>
                                                    ${formatNumber(selectedPerson.finalTotal)}
                                                </Text>
                                            </View>
                                        </View>
                                    </ScrollView>

                                    <TouchableOpacity
                                        style={styles.doneButton}
                                        onPress={handleCloseModal}
                                    >
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    rootContainer: {
        flex: 1,
        backgroundColor: "#1976d2",
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    spacer: {
        height: Platform.OS === "ios" ? 44 : StatusBar.currentHeight,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 0,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        padding: 16,
        paddingVertical: 12,
    },
    section: {
        paddingHorizontal: 16,
    },
    dragHandle: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 32,
    },
    chevron: {
        fontSize: 24,
        color: "#666",
        height: 24,
        lineHeight: 24,
    },
    swipeText: {
        alignSelf: "center",
        color: "#666",
        fontSize: 14,
        fontWeight: "300",
    },
    summaryContainer: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    sectionTitleShares: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    shareCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    personName: {
        fontSize: 16,
        fontWeight: "500",
    },
    amount: {
        fontSize: 16,
        color: theme.colors.primary,
    },
    summarySection: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingTop: 20,
        marginBottom: 0,
    },
    summaryContent: {
        gap: 8,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
    },
    totalRow: {
        flex: 1,
        justifyContent: "space-between",
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 12,
        marginTop: 8,
    },
    boldText: {
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: Dimensions.get("window").height * 0.7,
        paddingVertical: 8,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.primary,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: "#666",
    },
    modalScroll: {
        flex: 1,
    },
    itemsContainer: {
        padding: 16,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    itemNameContainer: {
        flex: 1,
        paddingRight: 8,
        maxWidth: "80%",
    },
    itemName: {
        fontSize: 16,
        marginBottom: 4,
        flexWrap: "wrap",
    },
    itemPrice: {
        fontSize: 16,
        width: 60,
        textAlign: "right",
    },
    splitText: {
        fontSize: 14,
        color: "#666",
    },
    totalContainer: {
        padding: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    doneButton: {
        backgroundColor: theme.colors.primary,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    doneButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    backButton: {
        padding: 8,
        marginLeft: 8,
        marginTop: 4,
    },
});

export default ReviewScreen;
