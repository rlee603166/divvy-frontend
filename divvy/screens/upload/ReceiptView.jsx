import React, { useState, useEffect } from "react";
import {
    Alert,
    View,
    Text,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    StyleSheet,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    LayoutAnimation,
    UIManager,
    Animated,
    Pressable,
    TouchableOpacity,
    Modal,
    Dimensions,
    Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { X, Plus, UserPlus, ReceiptText } from "lucide-react-native";
import ContactList from "../../components/main/ContactList";
import ReceiptItemView from "../../components/receipt/ReceiptItem";
import UserSelector from "../../components/receipt/UserSelector";
import InstructionBanner from "../../components/receipt/InstructionBanner";
import theme from "../../theme";
import ReceiptProcessor, { Item } from "../../services/ReceiptProcessor";

import { useUser } from "../../services/UserProvider";
import NewItemModal from "../../components/receipt/NewItemModal";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const customLayoutAnimation = {
    duration: 300,
    create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
    },
    update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
    },
    delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
    },
};

const BottomSheetModal = ({ visible, onClose, children }) => {
    const [animation] = useState(new Animated.Value(SCREEN_HEIGHT));
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.timing(animation, {
                toValue: 0,
                useNativeDriver: true,
                duration: 200,
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: SCREEN_HEIGHT,
                useNativeDriver: true,
                duration: 200,
            }).start(() => {
                setIsVisible(false);
            });
        }
    }, [visible]);

    if (!isVisible && !visible) return null;

    return (
        <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View
                    style={[
                        styles.bottomSheetContainer,
                        {
                            transform: [{ translateY: animation }],
                        },
                    ]}
                >
                    <View style={styles.bottomSheetHeader}>
                        <View style={styles.pullBar} />
                    </View>
                    <TouchableWithoutFeedback>
                        <View style={styles.bottomSheetContent}>{children}</View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const TotalAmountView = ({ totalAmount, isLoading, onSplitBill, disabled }) => (
    <View style={styles.totalContainer}>
        <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
        </View>

        <Pressable
            onPress={onSplitBill}
            disabled={isLoading || disabled}
            style={({ pressed }) => [
                styles.splitButton,
                (isLoading || disabled) && styles.splitButtonDisabled,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color="white" size="small" />
            ) : (
                <Text style={styles.splitButtonText}>Split Bill</Text>
            )}
        </Pressable>
    </View>
);

const ReceiptView = ({
    navigation,
    setStep,
    onProcessed,
    selectedPeople,
    photoUri,
    ocrData,
    setPeopleHashMap,
    onUpdatePeople,
    onUpdateReceipt,
    initialTotal,
}) => {
    const [transaction, setTransaction] = useState({ items: [] });
    const [group, setGroup] = useState({ members: [] });
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [disableAll, setDisableAll] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showContactList, setShowContactList] = useState(false);
    const [showPhoto, setShowPhoto] = useState(false);
    const [localSelectedPeople, setLocalSelectedPeople] = useState(null);
    const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const receiptProcessor = new ReceiptProcessor();
    const { id, name, username, profileImage } = useUser();

    // Initialize with selectedPeople on mount and handle OCR data
    useEffect(() => {
        if (selectedPeople && !localSelectedPeople) {
            setLocalSelectedPeople(selectedPeople);
            transformNames(selectedPeople);

            console.log(`selectedPeople ${JSON.stringify(selectedPeople, null, 2)}`);
        }
    }, [selectedPeople]);

    useEffect(() => {
        if (ocrData && Array.isArray(ocrData.items)) {
            // Ensure we keep the reset state of assignments when data is loaded
            setTransaction(prev => ({
                ...prev,
                items: ocrData.items.map(item => ({
                    ...item,
                    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
                    people: item.people || [], // Use empty array if no assignments
                    users: item.users || 1, // Reset to 1 if not assigned
                })),
            }));
            setTotalAmount(ocrData.subtotal || 0);
        }
    }, [ocrData]);

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            event => {
                LayoutAnimation.configureNext(customLayoutAnimation);
                setKeyboardHeight(event.endCoordinates.height);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                LayoutAnimation.configureNext(customLayoutAnimation);
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const getSubTotal = (items = []) => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((total, item) => {
            const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
            return total + (isNaN(price) ? 0 : price);
        }, 0);
    };

    const transformNames = newUsers => {
        if (!newUsers || !newUsers.uniqueMemberIds) return;

        console.log("Input newUsers:", JSON.stringify(newUsers, null, 2));
        console.log("uniqueMemberIds:", newUsers.uniqueMemberIds);

        const users = [...newUsers.uniqueMemberIds];
        const newMembers = users.map(user => {
            console.log(`Processing user ${user.name}:`, user);

            const member = {
                id: user.id,
                name: user.name,
                phone: user.phone || user.phoneNumbers?.[0]?.number,
                phoneNumbers: user.phoneNumbers,
                avatar: user.avatar,
                profileImage: user.profileImage,
                image: user.image,
            };

            console.log(`Transformed member ${member.name}:`, member);
            return member;
        });

        console.log("All transformed members:", newMembers);

        setGroup(prev => {
            const newGroup = {
                members: [
                    {
                        id: "you",
                        name: name,
                        avatar: profileImage,
                        profileImage: profileImage,
                        image: profileImage,
                        phone: null,
                    },
                    ...newMembers,
                ],
            };
            console.log("Final group:", newGroup);
            return newGroup;
        });
    };

    const handleAddPerson = () => {
        setShowContactList(true);
    };

    const handleSelectPeople = newSelectedPeople => {
        // Update local state
        setLocalSelectedPeople(newSelectedPeople);
        transformNames(newSelectedPeople);

        // Propagate changes up to parent
        onUpdatePeople(newSelectedPeople);

        setShowContactList(false);
    };

    const handleUpdate = (itemId, updatedItem) => {
        LayoutAnimation.configureNext(customLayoutAnimation);
        setTransaction(prev => {
            const newItems = prev.items.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        ...updatedItem,
                        price: Number(updatedItem.price),
                        people: updatedItem.people || [],
                        users: (updatedItem.people || []).length || 1,
                    };
                }
                return item;
            });

            // Calculate new total
            const newTotal = calculateTotal(newItems);
            setTotalAmount(newTotal);

            // Propagate changes to parent
            onUpdateReceipt(newItems, newTotal);

            return {
                ...prev,
                items: newItems,
            };
        });
    };

    const updateTotalAmount = items => {
        const newTotal = items.reduce((total, item) => {
            const itemTotal = Number(item.price) || 0;
            return total + itemTotal;
        }, 0);
        setTotalAmount(newTotal);
    };

    const handleDeleteItem = itemId => {
        setTransaction(prev => {
            const newItems = prev.items.filter(item => item.id !== itemId);
            const newTotal = calculateTotal(newItems);
            setTotalAmount(newTotal);

            // Propagate changes to parent
            onUpdateReceipt(newItems, newTotal);

            return {
                ...prev,
                items: newItems,
            };
        });
    };

    const handleAddItem = newItem => {
        const newItemWithId = {
            id: Date.now().toString(),
            name: newItem.name,
            price: Number(newItem.price),
            people: [],
            users: 1,
        };

        LayoutAnimation.configureNext(customLayoutAnimation);
        setTransaction(prev => {
            const newItems = [...(prev.items || []), newItemWithId];
            const newTotal = calculateTotal(newItems);
            setTotalAmount(newTotal);

            // Propagate changes to parent
            onUpdateReceipt(newItems, newTotal);

            return {
                ...prev,
                items: newItems,
            };
        });
    };

    const calculateTotal = items => {
        return items.reduce((total, item) => {
            return total + (typeof item.price === "number" ? item.price : 0);
        }, 0);
    };

    const handleBack = () => {
        setStep();
    };

    const handlePhotoPress = () => {
        setShowPhoto(true);
        Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePhotoRelease = () => {
        Animated.timing(fadeAnim2, {
            toValue: 0,
            duration: 75,
            useNativeDriver: true,
        }).start(() => {
            setShowPhoto(false);
        });
    };

    const handleSplitBill = () => {
        navigation.navigate("AdditionalCharges", {
            onSubmit: data => {
                const processedTransaction = {
                    items: transaction.items.map(item => ({
                        ...item,
                        price: Number(item.price),
                        people: item.people || [],
                    })),
                    subtotal: totalAmount,
                    additional: {
                        tax: Number(data.tax) || 0,
                        tip: Number(data.tip) || 0,
                        misc: Number(data.misc) || 0,
                    },
                };

                try {
                    const result = receiptProcessor.processReceipt(processedTransaction, group);

                    // Create peopleHashMap with all necessary data including phone numbers
                    const peopleMap = {};
                    group.members.forEach(member => {
                        peopleMap[member.name] = {
                            ...member,
                            avatar: member.avatar || member.profileImage || member.image,
                            phone: member.phone,
                            phoneNumbers: member.phoneNumbers,
                        };
                    });

                    console.log("Created peopleHashMap:", peopleMap); // Debug log
                    setPeopleHashMap(peopleMap);
                    onProcessed(result);
                } catch (error) {
                    Alert.alert(
                        "Error",
                        error.message || "An error occurred while processing the receipt"
                    );
                }
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Combined Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Assign your item(s)</Text>

                    <Pressable
                        onPress={handleAddPerson}
                        style={({ pressed }) => [
                            styles.addPersonButton,
                            { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        ]}
                    >
                        <UserPlus size={20} color={theme.colors.primary} />
                    </Pressable>
                </View>

                {/* Main Content */}
                <View style={[styles.innerContainer, { paddingTop: 8 }]}>
                    {/* Instruction Banner */}
                    <InstructionBanner selectedUser={selectedUser} />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: keyboardHeight + 10 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {transaction.items.map((item, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <View style={styles.receiptItemWrapper}>
                                    <ReceiptItemView
                                        group={group}
                                        item={item}
                                        onUpdateItem={handleUpdate}
                                        onDeleteItem={handleDeleteItem}
                                        disabled={disableAll}
                                        setDisabled={setDisableAll}
                                        isEditMode={isEditMode}
                                        selectedUser={selectedUser}
                                    />
                                </View>
                                {isEditMode && (
                                    <Pressable
                                        onPress={() => handleDeleteItem(item.id)}
                                        style={({ pressed }) => [
                                            styles.deleteButton,
                                            { transform: [{ scale: pressed ? 0.92 : 1 }] },
                                        ]}
                                    >
                                        <X size={16} color="white" />
                                    </Pressable>
                                )}
                            </View>
                        ))}

                        <Pressable
                            onPress={() => setShowNewItemModal(true)}
                            style={({ pressed }) => [
                                styles.newItemButton,
                                { transform: [{ scale: pressed ? 0.98 : 1 }] },
                            ]}
                        >
                            <View style={styles.plusIcon}>
                                <Plus size={16} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.newItemButtonText}>Add New Item</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                {/* User Selector */}
                <UserSelector
                    group={group}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                />

                {/* Total Amount */}
                <TotalAmountView
                    totalAmount={totalAmount}
                    // isLoading={isLoading}
                    onSplitBill={handleSplitBill}
                    disabled={isEditMode}
                />

                {/* Modals */}
                <BottomSheetModal
                    visible={showContactList}
                    onClose={() => setShowContactList(false)}
                >
                    <ContactList
                        setStep={() => setShowContactList(false)}
                        onSelectPeople={handleSelectPeople}
                        groupData={localSelectedPeople}
                        type="Done"
                        handleBack={() => setShowContactList(false)}
                        ifModal={true}
                        fetchedFriends={
                            localSelectedPeople?.friends || selectedPeople?.friends || []
                        }
                        fetchedGroups={localSelectedPeople?.groups || selectedPeople?.groups || []}
                    />
                </BottomSheetModal>

                <NewItemModal
                    visible={showNewItemModal}
                    onClose={() => setShowNewItemModal(false)}
                    onSubmit={handleAddItem}
                />

                {/* Photo Preview */}
                {photoUri && (
                    <Pressable
                        onPressIn={handlePhotoPress}
                        onPressOut={handlePhotoRelease}
                        style={({ pressed }) => [
                            styles.floatingPhotoButton,
                            { transform: [{ scale: pressed ? 0.98 : 1 }] },
                        ]}
                    >
                        <Text style={styles.photoButtonText}>View Receipt</Text>
                    </Pressable>
                )}

                <Animated.View
                    style={[
                        styles.photoOverlay,
                        {
                            opacity: fadeAnim2,
                            pointerEvents: showPhoto ? "auto" : "none",
                        },
                    ]}
                >
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.photoPreview}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        flex: 1,
        paddingLeft: 4,
    },
    backButton: {
        marginLeft: -10,
    },
    addPersonButton: {
        height: 36,
        width: 36,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
    },
    innerContainer: {
        flex: 1,
        paddingTop: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 10,
        paddingTop: 4,
    },
    itemContainer: {
        position: "relative",
        marginBottom: 4,
        marginTop: 4,
    },
    receiptItemWrapper: {
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    deleteButton: {
        position: "absolute",
        top: -12,
        left: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        zIndex: 2,
    },
    newItemButton: {
        backgroundColor: "#EEF2FF",
        padding: 16,
        borderRadius: 12,
        marginTop: 4,
        marginBottom: 40,
        marginHorizontal: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.05,
        // shadowRadius: 8,
        // elevation: 3,
    },
    newItemButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 8,
    },
    plusIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "white",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    totalLabel: {
        fontSize: 12,
        color: "#666",
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: "600",
        marginTop: 4,
    },
    splitButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    splitButtonDisabled: {
        backgroundColor: "#999",
    },
    splitButtonText: {
        color: "white",
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    bottomSheetContainer: {
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: SCREEN_HEIGHT * 0.9,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    bottomSheetHeader: {
        alignItems: "center",
        paddingVertical: 12,
        borderBottomColor: "rgba(0, 0, 0, 0)",
        borderBottomWidth: 1,
    },
    pullBar: {
        width: 36,
        height: 4,
        backgroundColor: "#D1D1D6",
        borderRadius: 2,
    },
    bottomSheetContent: {
        flex: 1,
    },
    floatingPhotoButton: {
        position: "absolute",
        right: 16,
        bottom: 225,
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 999,
    },
    photoButtonText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    photoIconWrapper: {
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    photoButtonText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    photoOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    photoPreview: {
        width: "90%",
        height: "70%",
        borderRadius: 12,
    },
    userSelectorContainer: {
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingBottom: Platform.OS === "ios" ? 20 : 0,
    },
});

export default ReceiptView;
