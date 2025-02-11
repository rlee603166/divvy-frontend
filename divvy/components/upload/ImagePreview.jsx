// components/upload/ImagePreview.js
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ImagePreview = ({ route, navigation }) => {
    const { imageUri } = route.params || {};

    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    image: {
        flex: 1,
    },
    closeButton: {
        position: "absolute",
        top: 40,
        left: 20,
        padding: 10,
    },
});

export default ImagePreview;
