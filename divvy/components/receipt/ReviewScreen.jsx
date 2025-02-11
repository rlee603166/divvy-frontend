import React, { useState, useRef, useEffect } from "react";
import ReceiptProcessor, { Person } from "../../services/ReceiptProcessor";
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
    Easing,
} from "react-native";
import theme from "../../theme";
import { useUser } from "../../services/UserProvider";
import { Image } from "expo-image";

const calculateTotals = data => {
    if (!data || typeof data !== "object") {
        return { subtotal: 0, tax: 0, tip: 0, misc: 0, total: 0 };
    }

    const personTotals = Object.entries(data)
        .filter(([key, value]) => value instanceof Person)
        .reduce(
            (acc, [_, person]) => ({
                subtotal: acc.subtotal + person.subtotal,
                tax: acc.tax + person.tax,
                tip: acc.tip + person.tip,
                misc: acc.misc + person.misc,
            }),
            { subtotal: 0, tax: 0, tip: 0, misc: 0 }
        );

    return {
        ...personTotals,
        total: personTotals.subtotal + personTotals.tax + personTotals.tip + personTotals.misc,
    };
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

const ReviewScreen = ({
    isDragging,
    processed,
    setStep,
    peopleHashMap,
    modalVisible, // Add this prop
    setModalVisible, // Add this prop
}) => {
    const [selectedPerson, setSelectedPerson] = useState(null);
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

    const { avatar } = useUser();

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
        }
    }, [processed]);

    const handlePersonPress = name => {
        if (!data[name]) return;

        // Reset animation values before opening
        slideAnim.setValue(Dimensions.get("window").height);
        fadeAnim.setValue(0);

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

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedPerson(null);

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
            // Reset animation values after close animation completes
            slideAnim.setValue(Dimensions.get("window").height);
            fadeAnim.setValue(0);
        });
    };

    const formatNumber = num => (num || 0).toFixed(2);

    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const getPersonImage = personName => {
        console.log("peopleHashMap:", peopleHashMap);
        console.log("looking for person:", personName);

        if (!peopleHashMap || !personName) {
            console.log("peopleHashMap or personName is missing");
            return null;
        }

        const person = peopleHashMap[personName];
        console.log("found person:", person);

        if (!person) {
            console.log("person not found in hashmap");
            return null;
        }

        let imageSource;
        // Check each possible image property
        if (person.id === "you") {
            imageSource = avatar;
        } else {
            imageSource = person.avatar || person.profileImage || person.image;
        }
        console.log("image source found:", imageSource);

        return imageSource;
    };

    const getInitials = name => {
        if (!name) return "";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            // If single word, take up to first two characters
            return words[0].substring(0, 2).toUpperCase();
        }
        // Take first character of first and last word
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 0, backgroundColor: "#fafafa" }}>
                <SafeAreaView style={{ flex: 0 }} edges={["top"]} />
            </View>

            <View style={[styles.mainContainer, { backgroundColor: "#fafafa" }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
                        <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Receipt Review</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Individual Shares</Text>

                    <ScrollView style={styles.sharesList}>
                        {Object.entries(data)
                            .filter(([key]) => !["tax", "tip", "misc"].includes(key))
                            .map(([name, person]) => (
                                <TouchableOpacity
                                    key={name}
                                    style={styles.shareCard}
                                    onPress={() => handlePersonPress(name)}
                                >
                                    <Text style={styles.personName}>{person.name}</Text>
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amount}>
                                            ${formatNumber(person?.finalTotal)}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={20} color="#666" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>

                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <View style={styles.summaryContent}>
                            {[
                                ["Subtotal", totals.subtotal],
                                ["Tax", totals.tax],
                                ["Tip", totals.tip],
                                ["Misc", totals.misc],
                            ].map(([label, value]) => (
                                <View key={label} style={styles.summaryRow}>
                                    <Text>{label}</Text>
                                    <Text>${formatNumber(value)}</Text>
                                </View>
                            ))}
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.boldText}>Total</Text>
                                <Text style={styles.boldText}>
                                    $
                                    {formatNumber(
                                        totals.subtotal + totals.tax + totals.tip + totals.misc
                                    )}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.swipeIndicator}>
                            <Animated.Text
                                style={[
                                    styles.chevron,
                                    { transform: [{ translateY: bounceAnim }] },
                                ]}
                            >
                                ︿
                            </Animated.Text>
                            <AnimatedSwipeText isDragging={isDragging} />
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ flex: 0, backgroundColor: theme.colors.primary }}>
                <SafeAreaView style={{ flex: 0 }} edges={["bottom"]} />
            </View>

            {modalVisible && selectedPerson && (
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {}}
                    animationType="none"
                    statusBarTranslucent={true}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <View style={styles.avatar}>
                                    {(() => {
                                        const imageSource = getPersonImage(selectedPerson.name);

                                        return imageSource ? (
                                            <Image
                                                source={{ uri: imageSource }}
                                                style={styles.avatarImage}
                                                contentFit="cover"
                                                transition={200}
                                            />
                                        ) : (
                                            <Text style={styles.avatarText}>
                                                {getInitials(selectedPerson.name)}
                                            </Text>
                                        );
                                    })()}
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
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.modalScroll}
                                contentContainerStyle={styles.modalScrollContent}
                                showsVerticalScrollIndicator={true}
                                bounces={false}
                                scrollEventThrottle={16}
                                onStartShouldSetResponder={() => true}
                                onStartShouldSetResponderCapture={() => true}
                                onMoveShouldSetResponder={() => true}
                                onMoveShouldSetResponderCapture={() => true}
                                onResponderTerminationRequest={() => false}
                            >
                                <View style={styles.itemsContainer}>
                                    {selectedPerson.items?.map((item, index) => (
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

                                <View style={styles.modalSummary}>
                                    {[
                                        ["Subtotal", selectedPerson.subtotal],
                                        ["Tax", selectedPerson.tax],
                                        ["Tip", selectedPerson.tip],
                                        ["Misc", selectedPerson.misc],
                                    ].map(([label, value]) => (
                                        <View key={label} style={styles.summaryRow}>
                                            <Text>{label}</Text>
                                            <Text>${formatNumber(value)}</Text>
                                        </View>
                                    ))}
                                    <View style={styles.modalTotalRow}>
                                        <Text style={styles.totalLabel}>Total</Text>
                                        <Text style={styles.totalAmount}>
                                            ${formatNumber(selectedPerson.finalTotal)}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <TouchableOpacity style={styles.doneButton} onPress={handleCloseModal}>
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Main container styles
    mainContainer: {
        flex: 1,
        backgroundColor: "#fafafa",
        marginBottom: 8,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // Header styles
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    backButton: {
        marginRight: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },

    // Content area styles
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 6,
        marginBottom: 18,
    },
    sharesList: {
        flex: 1,
    },

    // Share card styles
    shareCard: {
        backgroundColor: "white",
        paddingHorizontal: 20,
        borderRadius: 12,
        padding: 18,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    personName: {
        fontSize: 16,
        fontWeight: "500",
    },
    amountContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    amount: {
        fontSize: 16,
        color: theme.colors.primary,
    },

    // Summary section styles
    summary: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginHorizontal: -20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    summaryContent: {
        gap: 0,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    boldText: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.primary,
    },

    // Swipe indicator styles
    swipeIndicator: {
        alignItems: "center",
        paddingTop: 16,
    },
    chevron: {
        fontSize: 24,
        color: "#666",
        height: 24,
        lineHeight: 24,
    },
    swipeText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "300",
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: Dimensions.get("window").height * 0.7,
        maxHeight: Dimensions.get("window").height * 0.9, // Add maximum height
        paddingVertical: 20,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
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
        zIndex: 1, // Ensure button is always tappable
    },
    closeButtonText: {
        fontSize: 20,
        color: "#666",
        fontWeight: "500",
    },

    // Modal scroll content styles
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        flexGrow: 1,
    },
    itemsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
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

    // Modal summary styles
    modalSummary: {
        padding: 20,
        paddingTop: 0,
    },
    modalTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        marginTop: 12,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.primary,
        marginBottom: 12,
    },

    // Done button styles
    doneButton: {
        backgroundColor: theme.colors.primary,
        margin: 16,
        marginBottom: 22,
        padding: 16,
        borderRadius: 24,
        alignItems: "center",
    },
    doneButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default ReviewScreen;
