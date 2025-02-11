import { Image, View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import theme from "../../theme/index.js";

const Venmo = ({ user, onConfirm, onDeny, isLoading }) => {
    const apiURL = "http://47.144.148.193:8000/api/v1/users/venmo/";
    const [error, setError] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);


    const handleConfirm = async () => {
        onConfirm(user);
    };

    const handleDeny = async () => {
        onDeny();
    };

    if (error) return <Text>Error: {error}</Text>;

    return (
        <>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : userNotFound ? (
                <View style={styles.container}>
                    <Text style={styles.headerText}>User doesn't exist</Text>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.headerText}>Is this your account?</Text>
                        <View style={styles.venmoContainer}>
                            {user.photo ? (
                                <Image
                                    source={{
                                        uri: user.photo,
                                    }}
                                    style={styles.image}
                                />
                            ) : (
                                <View style={styles.initialsContainer}>
                                    <Text style={styles.initialsText}>{user.initials}</Text>
                                </View>
                            )}
                            <View style={styles.textContainer}>
                                <Text style={styles.name}>{user.name}</Text>
                                <Text style={styles.username}>@{user.username}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={handleDeny}
                        >
                            <Text style={styles.buttonSecondaryText}>No, that's not me</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.buttonPrimaryText}>Yes, that's me</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 32,
        textAlign: "center",
        color: "#333",
    },
    venmoContainer: {
        width: "100%",
        backgroundColor: "#f8f8f8",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "#fff",
    },
    initialsContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "#fff",
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    initialsText: {
        color: "#fff",
        fontSize: 40,
        fontWeight: "600",
        textAlign: "center",
    },
    textContainer: {
        alignItems: "center",
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
        color: "#000",
    },
    username: {
        fontSize: 16,
        color: "#666",
    },
    buttonContainer: {
        padding: 24,
        gap: 12,
        marginTop: "auto",
        paddingBottom: 45,
    },
    button: {
        width: "100%",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonPrimary: {
        backgroundColor: theme.colors.primary,
    },
    buttonSecondary: {
        backgroundColor: "#f0f0f0",
    },
    buttonPrimaryText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonSecondaryText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Venmo;
