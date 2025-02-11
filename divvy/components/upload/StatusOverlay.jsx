import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import * as Contacts from "expo-contacts";
import { useUser } from "../../services/UserProvider";
import theme from "../../theme/index";

const CheckIcon = memo(() => <Text style={styles.checkmark}>✓</Text>);

// Helper function to get initials
const getInitials = name => {
    // Split the name into words
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        // If single word, take up to first two characters
        return words[0].substring(0, 2).toUpperCase();
    } else {
        // Take first character of first and last word
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
};

const ContactImage = memo(({ imageUri, name }) => (
    <View style={styles.avatarContainer}>
        {imageUri ? (
            <Image
                style={styles.avatar}
                source={{ uri: imageUri }}
                resizeMode="cover"
                cachePolicy="memory"
            />
        ) : (
            <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
        )}
    </View>
));

const SelectedAvatars = memo(({ selectedItems, onRemove }) => {
    if (!selectedItems?.length) return null;

    return (
        <View>
            <ScrollView
                horizontal
                style={styles.selectedAvatarsContainer}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedAvatarsContent}
            >
                {selectedItems.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.selectedAvatarWrapper}
                        onPress={() => onRemove(item.id)}
                    >
                        {item.imageUri ? (
                            <Image
                                style={[
                                    styles.selectedAvatar,
                                    item.type === "group" && styles.selectedAvatarGroup,
                                ]}
                                source={{ uri: item.imageUri }}
                                resizeMode="cover"
                                cachePolicy="memory"
                            />
                        ) : (
                            <View
                                style={[
                                    styles.selectedAvatarFallback,
                                    item.type === "group" && styles.selectedAvatarGroup,
                                ]}
                            >
                                <Text style={styles.selectedAvatarText}>
                                    {getInitials(item.name)}
                                </Text>
                            </View>
                        )}
                        {item.type === "group" && (
                            <View style={styles.groupIndicator}>
                                <Text style={styles.groupIndicatorText}>G</Text>
                            </View>
                        )}
                        <View style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>-</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
});

const ContactItem = memo(({ item, onToggle, selectedTab }) => {
    const handlePress = useCallback(() => {
        onToggle(item.id);
    }, [item.id, onToggle]);

    return (
        <TouchableOpacity style={styles.contactItem} onPress={handlePress}>
            <ContactImage imageUri={item.imageUri} name={item.name} />
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>
                    {selectedTab === "groups"
                        ? `${item.members?.length || 0} members`
                        : item.phone || ""}
                </Text>
            </View>
            <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
                {item.selected && <CheckIcon />}
            </View>
        </TouchableOpacity>
    );
});

const ContactList = ({
    onSelectPeople,
    type,
    handleBack,
    ifModal,
    groupData,
    fetchedFriends,
    fetchedGroups,
}) => {
    // Refs for maintaining data consistency
    const contactsRef = useRef([]);
    const friendsRef = useRef([]);
    const groupsRef = useRef([]);

    // State management
    const [contacts, setContacts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const { user_id } = useUser();

    const calculateFilteredData = useCallback(
        (currentData, query) => {
            if (!currentData) return [];
            if (query.trim() === "") return currentData;

            const lowercaseQuery = query.toLowerCase();
            return currentData.filter(item =>
                selectedTab === "groups"
                    ? item.name.toLowerCase().includes(lowercaseQuery) ||
                      item.members?.some(member =>
                          member.name.toLowerCase().includes(lowercaseQuery)
                      )
                    : item.name.toLowerCase().includes(lowercaseQuery) ||
                      (item.phone && item.phone.toLowerCase().includes(lowercaseQuery))
            );
        },
        [selectedTab]
    );

    const loadContacts = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                // In loadContacts function
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.Name,
                        Contacts.Fields.PhoneNumbers,
                        Contacts.Fields.Image,
                        Contacts.Fields.ImageAvailable,
                    ],
                });

                if (data.length > 0) {
                    // Debug log raw contact data
                    console.log("Raw contact data example:", data[0]);

                    const formattedContacts = data
                        .filter(contact => contact.name)
                        .map(contact => {
                            // Debug log each contact's phone numbers
                            console.log(`Phone numbers for ${contact.name}:`, contact.phoneNumbers);

                            return {
                                id: contact.id,
                                name: contact.name,
                                // Get primary phone number if available
                                phone: contact.phoneNumbers?.[0]?.number || "",
                                // Store all phone numbers
                                phoneNumbers: contact.phoneNumbers,
                                imageUri: contact.imageAvailable
                                    ? `file://${contact.image?.uri}`
                                    : null,
                                selected: false,
                            };
                        })
                        .sort((a, b) => a.name.localeCompare(b.name));

                    console.log("Formatted contact example:", formattedContacts[0]);
                    contactsRef.current = formattedContacts;
                    setContacts(formattedContacts);
                }
            }
        } catch (error) {
            console.error("Contact loading error:", error);
            Alert.alert("Error", "Failed to load contacts");
        }
    };

    // Initialize data
    useEffect(() => {
        let mounted = true;

        const initializeData = async () => {
            try {
                setLoading(true);
                await loadContacts();

                if (ifModal && groupData) {
                    const selectedIds = new Set(groupData.uniqueMemberIds.map(member => member.id));

                    if (mounted) {
                        const updatedFriends = (groupData.friends || []).map(friend => ({
                            ...friend,
                            selected: selectedIds.has(friend.id),
                        }));

                        const updatedGroups = (groupData.groups || []).map(group => ({
                            ...group,
                            selected: selectedIds.has(group.id),
                        }));

                        const updatedContacts = contactsRef.current.map(contact => ({
                            ...contact,
                            selected: selectedIds.has(contact.id),
                        }));

                        setFriends(updatedFriends);
                        setGroups(updatedGroups);
                        setContacts(updatedContacts);
                        console.log(updatedFriends);

                        friendsRef.current = updatedFriends;
                        groupsRef.current = updatedGroups;
                        contactsRef.current = updatedContacts;
                    }
                } else {
                    if (mounted) {
                        const initialFriends =
                            fetchedFriends?.map(friend => ({ ...friend, selected: false })) || [];
                        const initialGroups =
                            fetchedGroups?.map(group => ({ ...group, selected: false })) || [];

                        setFriends(initialFriends);
                        setGroups(initialGroups);

                        friendsRef.current = initialFriends;
                        groupsRef.current = initialGroups;
                    }
                }
            } catch (error) {
                console.error("Error initializing data:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeData();

        return () => {
            mounted = false;
        };
    }, []);

    // Update filtered data when tab or search changes
    useEffect(() => {
        const currentData =
            selectedTab === "contacts" ? contacts : selectedTab === "friends" ? friends : groups;

        const newFilteredData = calculateFilteredData(currentData, searchQuery);
        setFilteredData(newFilteredData);
    }, [selectedTab, searchQuery, contacts, friends, groups, calculateFilteredData]);

    const getAllSelectedItems = useCallback(() => {
        const selectedContacts = contacts.filter(item => item.selected) || [];
        console.log("Selected contacts:", selectedContacts);

        const selectedFriends = friends.filter(item => item.selected) || [];
        console.log("Selected friends:", selectedFriends);

        const selectedGroups = groups.filter(item => item.selected) || [];
        console.log("Selected groups:", selectedGroups);

        const memberMap = new Map();

        selectedContacts.forEach(contact => {
            console.log(`Processing contact ${contact.name}:`, contact);
            memberMap.set(contact.id, {
                id: contact.id,
                name: contact.name,
                imageUri: contact.imageUri,
                profileImage: contact.imageUri,
                image: contact.imageUri,
                phone: contact.phone,
                phoneNumbers: contact.phoneNumbers,
                type: "contact",
            });
        });

        const result = Array.from(memberMap.values());
        console.log("Final memberMap result:", result);
        return result;
    }, [contacts, friends, groups]);

    const hasSelectedItems = useCallback(() => {
        return getAllSelectedItems().length > 0;
    }, [getAllSelectedItems]);

    const removeSelection = useCallback(
        id => {
            const updateList = (list, setList, ref) => {
                const updatedList = list.map(item => {
                    if (item.id === id) {
                        return { ...item, selected: false };
                    }
                    if (item.members) {
                        const memberIds = item.members.map(m => m.id);
                        if (memberIds.includes(id)) {
                            return { ...item, selected: false };
                        }
                    }
                    return item;
                });
                setList(updatedList);
                ref.current = updatedList;
                return updatedList;
            };

            updateList(contacts, setContacts, contactsRef);
            updateList(friends, setFriends, friendsRef);
            updateList(groups, setGroups, groupsRef);
        },
        [contacts, friends, groups]
    );

    const toggleSelection = useCallback(
        id => {
            const isUserAlreadySelected = userId => {
                const selectedFriendIds = new Set(friends.filter(f => f.selected).map(f => f.id));
                const selectedContactIds = new Set(contacts.filter(c => c.selected).map(c => c.id));
                const selectedGroupMemberIds = new Set(
                    groups
                        .filter(g => g.selected)
                        .flatMap(g => g.members || [])
                        .map(m => m.id)
                );

                if (selectedTab === "friends") selectedFriendIds.delete(userId);
                if (selectedTab === "contacts") selectedContactIds.delete(userId);

                return (
                    selectedFriendIds.has(userId) ||
                    selectedContactIds.has(userId) ||
                    selectedGroupMemberIds.has(userId)
                );
            };

            const updateList = (list, setList, ref) => {
                const itemToUpdate = list.find(item => item.id === id);
                if (!itemToUpdate) return list;

                if (!itemToUpdate.selected && selectedTab !== "groups") {
                    if (isUserAlreadySelected(itemToUpdate.id)) {
                        Alert.alert(
                            "Duplicate Selection",
                            "User already selected from another category."
                        );
                        return list;
                    }
                }

                const updatedList = list.map(item =>
                    item.id === id ? { ...item, selected: !item.selected } : item
                );
                setList(updatedList);
                ref.current = updatedList;
                return updatedList;
            };

            let updatedData;
            switch (selectedTab) {
                case "contacts":
                    updatedData = updateList(contacts, setContacts, contactsRef);
                    break;
                case "friends":
                    updatedData = updateList(friends, setFriends, friendsRef);
                    break;
                case "groups":
                    updatedData = updateList(groups, setGroups, groupsRef);
                    break;
                default:
                    return;
            }

            if (searchQuery.trim() === "") {
                setFilteredData(updatedData);
            }
        },
        [selectedTab, contacts, friends, groups, searchQuery]
    );

    const onNext = useCallback(() => {
        const uniqueMembersMap = new Map();

        groups
            .filter(g => g.selected)
            .flatMap(g => g.members || [])
            .filter(member => member.id !== user_id && member.user_id !== user_id)
            .forEach(member => uniqueMembersMap.set(member.id, member));

        friends
            .filter(f => f.selected)
            .filter(friend => friend.id !== user_id && friend.user_id !== user_id)
            .forEach(friend => uniqueMembersMap.set(friend.id, friend));

        contacts
            .filter(c => c.selected)
            .filter(contact => contact.id !== user_id && contact.user_id !== user_id)
            .forEach(contact => uniqueMembersMap.set(contact.id, contact));

        const selectedData = {
            contacts: contacts,
            friends: friends,
            groups: groups,
            uniqueMemberIds: Array.from(uniqueMembersMap.values()),
        };

        onSelectPeople(selectedData);
    }, [contacts, friends, groups, user_id, onSelectPeople]);

    const renderItem = useCallback(
        ({ item }) => (
            <ContactItem item={item} onToggle={toggleSelection} selectedTab={selectedTab} />
        ),
        [selectedTab, toggleSelection]
    );

    const keyExtractor = useCallback(item => String(item.id), []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6466F1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {type === "Next" ? "Select People" : "Edit People"}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                    <Text style={styles.closeButtonText}> </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${selectedTab}...`}
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            <SelectedAvatars selectedItems={getAllSelectedItems()} onRemove={removeSelection} />

            <View style={styles.tabSection}>
                <View style={styles.tabButtons}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "friends" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("friends")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "friends" && styles.activeButtonText,
                            ]}
                        >
                            Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "groups" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("groups")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "groups" && styles.activeButtonText,
                            ]}
                        >
                            Groups
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "contacts" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("contacts")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "contacts" && styles.activeButtonText,
                            ]}
                        >
                            Contacts
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={false}
                initialNumToRender={20}
                maxToRenderPerBatch={15}
                windowSize={10}
                updateCellsBatchingPeriod={50}
                getItemLayout={(data, index) => ({
                    length: 56,
                    offset: 56 * index,
                    index,
                })}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10,
                }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                )}
            />

            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.floatingButton,
                        !hasSelectedItems() && styles.floatingButtonDisabled,
                    ]}
                    onPress={onNext}
                    disabled={!hasSelectedItems()}
                >
                    <Text style={styles.floatingButtonText}>{type}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: "300",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "400",
        flex: 1,
        textAlign: "center",
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginVertical: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        padding: 0,
        height: 24,
    },
    tabSection: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    tabButtons: {
        flexDirection: "row",
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        minWidth: 100,
        alignItems: "center",
        borderColor: "#6466F1",
        borderWidth: 1,
    },
    tabButtonActive: {
        backgroundColor: "#6466F1",
    },
    tabButtonText: {
        color: "#6466F1",
        fontSize: 15,
        fontWeight: "400",
    },
    activeButtonText: {
        color: "white",
        fontSize: 15,
        fontWeight: "400",
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#666666",
        fontSize: 16,
        fontWeight: "500",
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        color: "#000",
        marginBottom: 2,
        fontWeight: "400",
    },
    contactPhone: {
        fontSize: 14,
        color: "#666",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: "#D1D1D6",
        borderRadius: 4,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: "#6466F1",
        borderColor: "#6466F1",
    },
    checkmark: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: -2,
    },
    floatingButtonContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    floatingButton: {
        backgroundColor: "#6466F1",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 120,
        alignItems: "center",
    },
    floatingButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    floatingButtonDisabled: {
        backgroundColor: "#A5A6F6",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
    },
    avatarContainer: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    selectedAvatarsContainer: {
        maxHeight: 70,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    selectedAvatarsContent: {
        gap: 12,
        paddingVertical: 4,
    },
    selectedAvatarWrapper: {
        position: "relative",
    },
    selectedAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    selectedAvatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedAvatarText: {
        color: "#666",
        fontSize: 18,
        fontWeight: "500",
    },
    removeButton: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },
    removeButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: -2,
    },
    selectedAvatarGroup: {},
    groupIndicator: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#147337",
        justifyContent: "center",
        alignItems: "center",
    },
    groupIndicatorText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "bold",
        marginTop: -2,
    },
});

export default memo(ContactList);
