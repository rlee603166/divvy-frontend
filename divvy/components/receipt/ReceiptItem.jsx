import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../theme/index";

const PeopleToggleButton = ({ name, isSelected, onToggle, isEveryone }) => (
    <TouchableOpacity
        onPress={onToggle}
        style={[
            styles.toggleButton,
            isSelected && styles.toggleButtonSelected,
            isEveryone && styles.everyoneButton,
        ]}
    >
        <View style={styles.toggleButtonContent}>
            <Text
                style={[
                    styles.toggleButtonText,
                    isSelected && styles.toggleButtonTextSelected,
                    isEveryone && styles.everyoneButtonText,
                ]}
            >
                {name}
            </Text>
            <Ionicons
                name={isSelected ? "remove" : "add"}
                size={12}
                color={isSelected ? theme.colors.primary : "#666"}
            />
        </View>
    </TouchableOpacity>
);

const ReceiptItemView = ({ group, item, onUpdateItem, disabled, setDisabled, isEditMode }) => {
    useEffect(() => {
        console.log(group);
    }, []);

    const [priceInput, setPriceInput] = useState(item.price.toString());
    const [nameInput, setNameInput] = useState(item.name);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [selectedPeople, setSelectedPeople] = useState(
        new Set(item.people?.map(p => p.id) || [])
    );
    const expandAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const maxHeight = 250;

    useEffect(() => {
        if (disabled || isEditMode) {
            setIsEditingName(false);
            setIsEditingPrice(false);
            setDisabled(false);
        }
    }, [disabled]);

    useEffect(() => {
        setPriceInput(item.price.toFixed(2));
        setNameInput(item.name);
    }, [item.price, item.name]);

    const getNumericPrice = price => {
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        return isNaN(numPrice) ? 0 : Number(numPrice.toFixed(2));
    };

    const handlePriceInputChange = text => {
        if (text === "" || text === "." || /^\d*\.?\d{0,2}$/.test(text)) {
            setPriceInput(text);
        }
    };

    const handlePriceSubmit = () => {
        let numericPrice = getNumericPrice(priceInput);
        onUpdateItem(item.id, {
            ...item,
            price: numericPrice,
        });
        setPriceInput(numericPrice.toFixed(2));
        setIsEditingPrice(false);
    };

    const handleNameInputChange = text => {
        setNameInput(text);
    };

    const handleNameSubmit = () => {
        onUpdateItem(item.id, {
            ...item,
            name: nameInput,
        });
        setIsEditingName(false);
    };

    const toggleExpand = () => {
        if (isEditMode) return;

        if (isEditingName || isEditingPrice) {
            if (isEditingPrice) handlePriceSubmit();
            if (isEditingName) handleNameSubmit();
            setIsEditingName(false);
            setIsEditingPrice(false);
            return;
        }

        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.spring(rotateAnim, {
                toValue,
                useNativeDriver: true,
                friction: 8,
            }),
            Animated.spring(expandAnim, {
                toValue,
                useNativeDriver: false,
                friction: 8,
            }),
        ]).start();

        setIsExpanded(!isExpanded);
    };

    const toggleEveryone = () => {
        const allPeopleIds = group.members.map(person => person.id);
        const isEveryoneSelected = selectedPeople.size === group.members.length;
        const newSelectedPeople = isEveryoneSelected ? new Set() : new Set(allPeopleIds);

        setSelectedPeople(newSelectedPeople);
        onUpdateItem(item.id, {
            ...item,
            people: Array.from(newSelectedPeople),
        });
    };

    const togglePerson = personName => {
        const newSelectedPeople = new Set(selectedPeople);
        if (newSelectedPeople.has(personName)) {
            newSelectedPeople.delete(personName);
        } else {
            newSelectedPeople.add(personName);
        }
        setSelectedPeople(newSelectedPeople);

        onUpdateItem(item.id, {
            ...item,
            people: Array.from(newSelectedPeople),
        });
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    const heightInterpolate = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, maxHeight],
    });

    const calculateAmountPerPerson = () => {
        const numericPrice = getNumericPrice(item.price);
        return selectedPeople.size > 0 ? numericPrice / selectedPeople.size : numericPrice;
    };

    const amountPerPerson = calculateAmountPerPerson();
    const isEveryoneSelected = selectedPeople.size === group.members.length;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleExpand} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.itemInfo}>
                        <View style={styles.nameContainer}>
                            {isEditingName ? (
                                <TextInput
                                    style={[styles.input, styles.nameInput]}
                                    value={nameInput}
                                    onChangeText={handleNameInputChange}
                                    onSubmitEditing={handleNameSubmit}
                                    onBlur={handleNameSubmit}
                                    autoFocus
                                />
                            ) : (
                                <TouchableOpacity
                                    onPress={e => {
                                        e.stopPropagation();
                                        setIsEditingName(true);
                                    }}
                                    style={styles.nameWrapper}
                                >
                                    <Text style={styles.itemName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.peopleCount}>
                            <Ionicons name="people" size={16} color="#666" />
                            <Text style={styles.peopleCountText}>
                                People: {selectedPeople.size}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        {isEditingPrice ? (
                            <TextInput
                                style={[styles.input, styles.priceInput]}
                                value={priceInput}
                                onChangeText={handlePriceInputChange}
                                onSubmitEditing={handlePriceSubmit}
                                onBlur={handlePriceSubmit}
                                keyboardType="decimal-pad"
                                autoFocus
                                selectTextOnFocus={true}
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={e => {
                                    e.stopPropagation();
                                    setIsEditingPrice(true);
                                }}
                            >
                                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                            </TouchableOpacity>
                        )}

                        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                            <Ionicons name="chevron-up" size={16} color="#666" />
                        </Animated.View>
                    </View>
                </View>
            </TouchableOpacity>

            <Animated.View style={[styles.expandedContent, { maxHeight: heightInterpolate }]}>
                <View style={styles.peopleSelector}>
                    <Text style={styles.sectionTitle}>Split with</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.peopleScrollView}
                    >
                        <PeopleToggleButton
                            name="Everyone"
                            isSelected={isEveryoneSelected}
                            onToggle={toggleEveryone}
                            isEveryone={true}
                        />
                        {group.members.map(person => {
                            const firstName = person.name.split(" ")[0];
                            const duplicateFirstName =
                                group.members.filter(p => p.name.split(" ")[0] === firstName)
                                    .length > 1;

                            const displayName = duplicateFirstName
                                ? `${firstName} (${person.phone})`
                                : firstName;

                            return (
                                <PeopleToggleButton
                                    key={person.id}
                                    name={displayName}
                                    isSelected={selectedPeople.has(person.id)}
                                    onToggle={() => togglePerson(person.id)}
                                    isEveryone={false}
                                />
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.amountSection}>
                    <View style={styles.amountHeader}>
                        <Text style={styles.amountTitle}>Amount per person</Text>
                        <Text style={styles.peopleCount}>{selectedPeople.size} people</Text>
                    </View>
                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Each pays</Text>
                        <Text style={styles.amountPerPerson}>${amountPerPerson.toFixed(2)}</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginHorizontal: 2,
        marginVertical: 4,
        overflow: "hidden",
    },
    header: {
        padding: 16,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemInfo: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    nameWrapper: {
        alignSelf: "flex-start",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    peopleCount: {
        flexDirection: "row",
        alignItems: "center",
    },
    peopleCountText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 4,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 8,
    },
    nameInput: {
        width: 120,
        fontSize: 16,
    },
    priceInput: {
        width: 80,
        marginRight: 8,
    },
    expandedContent: {
        backgroundColor: "#F9F9F9",
        overflow: "hidden",
    },
    peopleSelector: {
        marginHorizontal: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    peopleScrollView: {
        flexDirection: "row",
    },
    toggleButton: {
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        marginRight: 8,
        padding: 8,
    },
    toggleButtonSelected: {
        backgroundColor: theme.colors.primary + "20",
    },
    everyoneButton: {
        fontWeight: "600",
    },
    everyoneButtonText: {
        fontWeight: "600",
    },
    toggleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    toggleButtonText: {
        color: "#666",
        marginRight: 4,
    },
    toggleButtonTextSelected: {
        color: theme.colors.primary,
    },
    amountSection: {
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        padding: 16,
    },
    amountHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    amountTitle: {
        fontSize: 14,
        color: "#666",
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    amountPerPerson: {
        fontSize: 20,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
});

export default ReceiptItemView;
