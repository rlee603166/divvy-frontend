import React, { useState, useRef, forwardRef } from "react";
import {
    View,
    Animated,
    Dimensions,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from "react-native";
import UsernameInput from "../../components/auth/UsernameInput";
import SMSVerificationView from "../../components/auth/SMSVerificationView";

import { useUser } from "../../services/UserProvider";
import theme from "../../theme/index.js";

const LoginScreen = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [step, setStep] = useState(0);
    const prompt = "Enter your username:";

    const { requestVerificationCode, login } = useUser();

    const handleUsername = async username => {
        try {
            const data = await requestVerificationCode(username);
            if (data.status !== "verification_sent") return;

            setUser({
                username: username,
                phone: data.phone_number,
            });
            setStep(1);
        } catch {}
    };

    const handleSMS = async code => {
        try {
            const isLogin = await login(user.username, user.phone, code);
        } catch (error) {}
    };

    const handleBack = () => {
        if (step === 0) {
            navigation.pop();
        } else {
            setStep(step - 1);
        }
    };

    const render = () => {
        switch (step) {
            case 0:
                return <UsernameInput onSubmit={handleUsername} prompt={prompt} />;
            case 1:
                return <SMSVerificationView phone={user.phone} onNext={handleSMS} />;
            default:
                return;
        }
    };

    return (
        <View style={styles.root}>
            <Header handleBack={handleBack} step={step} />
            {render()}
        </View>
    );
};

export const Header = ({ handleBack, step }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <View style={styles.headerButton}>
                    {step ? (
                        <Text style={styles.closeButtonText}>Back</Text>
                    ) : (
                        <Text style={styles.closeButton}>x</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        backgroundColor: "white",
    },
    headerContainer: {
        backgroundColor: "white",
    },
    headerButton: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignSelf: "flex-start",
    },
    headerButtonText: {
        fontSize: 24,
        color: theme.colors.primary,
        lineHeight: 22,
    },
    closeButton: {
        fontSize: 24,
        color: "#666",
        lineHeight: 24,
    },
    closeButtonText: {
        fontSize: 18,
        color: theme.colors.primary,
        lineHeight: 24,
    },
    slideContainer: {
        flex: 1,
        overflow: "hidden",
    },
});

export default LoginScreen;
