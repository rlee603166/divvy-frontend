// PhotoReview.js
import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { Check, RotateCcw } from "lucide-react-native";
import theme from "../../theme";

const PhotoReview = ({ photoUri, onRetake, onAccept }) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />

            <SafeAreaView style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={onRetake}>
                    <RotateCcw color="white" size={24} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
                    <Check color="white" size={24} />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    preview: {
        flex: 1,
        width: "100%",
    },
    controls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        padding: 40,
        gap: 80,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    acceptButton: {
        backgroundColor: theme.colors.primary,
    },
});

export default PhotoReview;
