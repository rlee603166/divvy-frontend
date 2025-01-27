import React, { useState, useEffect } from "react";
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
import UserService from "../../services/UserService";
import { useUser } from "../../services/UserProvider";

const ContactList = ({
    onSelectPeople,
    type,
    handleBack,
    ifModal,
    groupData,
    fetchedFriends,
    fetchedGroups,
}) => {
    const [contacts, setContacts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    const { user_id } = useUser();

    useEffect(() => {
        const initializeData = async () => {
            await loadContacts();
            if (ifModal) {
                setFriends(groupData.friends);
                setGroups(groupData.groups);
                setContacts(groupData.contacts);
                return;
            }
            setFriends(fetchedFriends);
            setGroups(fetchedGroups);
        };

        try {
            setLoading(true);
            initializeData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const currentData =
            selectedTab === "contacts" ? contacts : selectedTab === "friends" ? friends : groups;

        if (searchQuery.trim() === "") {
            setFilteredData(currentData);
        } else {
            const lowercaseQuery = searchQuery.toLowerCase();
            const filtered = currentData.filter(item =>
                selectedTab === "groups"
                    ? item.name.toLowerCase().includes(lowercaseQuery) ||
                      item.members.some(member =>
                          member.name.toLowerCase().includes(lowercaseQuery)
                      )
                    : item.name.toLowerCase().includes(lowercaseQuery) ||
                      (item.phone && item.phone.toLowerCase().includes(lowercaseQuery))
            );
            setFilteredData(filtered);
        }
    }, [selectedTab, contacts, friends, groups, searchQuery]);

    const loadContacts = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.Name,
                        Contacts.Fields.PhoneNumbers,
                        Contacts.Fields.Image,
                        Contacts.Fields.ImageAvailable,
                    ],
                });

                if (data.length > 0) {
                    const formattedContacts = data
                        .filter(contact => contact.name)
                        .map(contact => ({
                            id: contact.id,
                            name: contact.name,
                            phone: contact.phoneNumbers?.[0]?.number,
                            imageUri: contact.imageAvailable
                                ? `file://${contact.image?.uri}`
                                : null,
                            selected: false,
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    setContacts(formattedContacts);
                    setFilteredData(formattedContacts);
                }
            }
        } catch (error) {
            console.error("Contact loading error:", error);
            Alert.alert("Error", "Failed to load contacts");
        }
    };

    const getAllSelectedItems = () => {
        const selectedContacts = contacts?.filter(item => item.selected) || [];
        const selectedFriends = friends?.filter(item => item.selected) || [];
        const selectedGroups = groups?.filter(item => item.selected) || [];

        return [...selectedContacts, ...selectedFriends, ...selectedGroups];
    };

    const hasSelectedItems = () => {
        return getAllSelectedItems().length > 0;
    };
    const toggleSelection = id => {
        const isUserAlreadySelected = userId => {
            const selectedFriendIds = new Set(friends.filter(f => f.selected).map(f => f.id));
            const selectedContactIds = new Set(contacts.filter(c => c.selected).map(c => c.id));
            const selectedGroupMemberIds = new Set(
                groups
                    .filter(g => g.selected)
                    .flatMap(g => g.members)
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

        const isUserInSelectedGroups = userId => {
            return groups.filter(g => g.selected).some(g => g.members.some(m => m.id === userId));
        };

        const updateList = (list, setList) => {
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

                if (isUserInSelectedGroups(itemToUpdate.id)) {
                    Alert.alert(
                        "Duplicate Selection",
                        "User already included in a selected group."
                    );
                    return list;
                }
            }

            const updatedList = list.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            );
            setList(updatedList);
            return updatedList;
        };

        let updatedData;
        switch (selectedTab) {
            case "contacts":
                updatedData = updateList(contacts, setContacts);
                break;
            case "friends":
                updatedData = updateList(friends, setFriends);
                break;
            case "groups":
                updatedData = updateList(groups, setGroups);
                break;
        }

        if (searchQuery.trim() === "") {
            setFilteredData(updatedData);
        }
    };

    const onNext = () => {
        const uniqueMembersMap = new Map();

        groups
            .filter(g => g.selected)
            .flatMap(g => g.members)
            .filter(member => member.id !== user_id && member.user_id !== user_id) // Filter out both id and user_id
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
    };

    const CheckIcon = () => <Text style={styles.checkmark}>✓</Text>;

    const ContactImage = ({ imageUri, name }) => (
        <View style={styles.avatarContainer}>
            {imageUri ? (
                <Image
                    style={styles.avatar} // Use the same style you already have
                    source={{ uri: imageUri }}
                    resizeMode="cover"
                    cachePolicy="memory"
                />
            ) : (
                <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
        </View>
    );

    const SelectedHeader = () => {
        const allSelectedItems = getAllSelectedItems();

        return (
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={["rgb(255, 255, 255)", "rgba(255, 255, 255, 0)"]}
                    start={[0, 0]}
                    end={[0.7, 0]}
                    style={styles.leftGradient}
                    pointerEvents="none"
                />

                <ScrollView
                    horizontal
                    style={styles.selectedHeader}
                    contentContainerStyle={styles.selectedHeaderContent}
                    showsHorizontalScrollIndicator={false}
                >
                    {allSelectedItems.map(item => (
                        <ContactImage key={item.id} imageUri={item.imageUri} name={item.name} />
                    ))}
                </ScrollView>

                <LinearGradient
                    colors={["rgba(255, 255, 255, 0)", "rgb(255, 255, 255)"]}
                    start={[0.3, 0]}
                    end={[1, 0]}
                    style={styles.rightGradient}
                    pointerEvents="none"
                />
            </View>
        );
    };

    const ContactItem = ({ item }) => (
        <TouchableOpacity style={styles.contactItem} onPress={() => toggleSelection(item.id)}>
            {item.imageUri ? (
                <Image
                    style={styles.avatar}
                    source={{ uri: item.imageUri }}
                    resizeMode="cover"
                    cachePolicy="memory"
                />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
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

            {hasSelectedItems() && <SelectedHeader />}

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
                renderItem={({ item }) => (
                    <ContactItem item={item} onToggle={toggleSelection} selectedTab={selectedTab} />
                )}
                keyExtractor={item => String(item.id)}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                getItemLayout={(data, index) => ({
                    length: 56,
                    offset: 56 * index,
                    index,
                })}
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
        borderRadius: 20, // Make it circular
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
    headerContainer: {
        position: "relative",
        height: 55,
        marginTop: 8,
        backgroundColor: "#fff",
    },
    selectedHeader: {
        height: "100%",
    },
    selectedHeaderContent: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
    },
    leftGradient: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 32,
        zIndex: 1,
    },
    rightGradient: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 32,
        zIndex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        marginHorizontal: 4,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20, // Make it circular
    },
    floatingButtonContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 20,
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
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
});

export default ContactList;
