import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUser } from "./../../services/UserProvider";
import { Image } from "expo-image";

const ProfileIcon = ({
    size = 40,
    backgroundColor = "#6366f1",
    textColor = "#ffffff",
    fontSize = 16,
}) => {
    const { name, avatar } = useUser();

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {avatar ? (
                <Image
                    style={styles.avatar}
                    source={{ uri: avatar }}
                    resizeMode="cover"
                    cachePolicy="memory"
                />
            ) : (
                <View
                    style={[
                        styles.container,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.text,
                            {
                                color: textColor,
                                fontSize,
                            },
                        ]}
                    >
                        {name ? getInitials(name) : "?"}
                    </Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontWeight: "bold",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
});

export default ProfileIcon;
