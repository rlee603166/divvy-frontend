import { useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import UsernameInput from "../../components/auth/UsernameInput";
import Venmo from "../../components/auth/Venmo";
import SMSVerificationView from "../../components/auth/SMSVerificationView";
import PhoneInputView from "../../components/auth/PhoneInput";
import LoadingWrapper from "../../components/main/LoadingWrapper";
import { Header } from "./LoginScreen";
import theme from "../../theme/index.js";
import { useUser } from "../../services/UserProvider";

const SignUpScreen = ({ navigation }) => {
    const [newUser, setNewUser] = useState({});
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const prompt = "Enter your Venmo username:";
    const apiURL = "http://47.144.148.193:8000/api/v1/users/venmo/";
    const [smsError, setSMSError] = useState(null);

    const { register } = useUser();

    const handlePhone = async phone => {
        console.log(phone);
        setNewUser(prev => ({
            ...prev,
            phone,
        }));
        setStep(1);
    };

    const handleSMS = async code => {
        const url = "http://47.144.148.193:8000/api/v1/users/registerSMS";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone: newUser.phone, code }),
        });

        const data = await response.json();
        return data;
    };

    const handleVenmo = async username => {
        const data = await fetchVenmo(username);
        if (!data) {
            return;
        }
        setError(null);
        setStep(3);
    };

    const fetchVenmo = async username => {
        setIsLoading(true);
        console.log("Loading started:", isLoading); // Debugging log
        try {
            const url = `${apiURL}${username}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.detail === "Profile not found or page took too long to load") {
                setError("User does not exist. Please check the username and try again.");
                return;
            } else {
                const newUser = {
                    name: data.name,
                    username: data.handle,
                    photo: data.profile_image,
                    initials: data.initials,
                };

                setNewUser(prev => ({
                    ...prev,
                    name: data.name,
                    username: data.handle,
                    photo: data.profile_image,
                    initials: data.initials,
                }));
                return newUser;
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
            console.log("Loading ended:", isLoading); // Debugging log
        }
    };

    const handleBack = () => {
        if (!step) {
            navigation.pop();
        }
        setStep(step - 1);
    };

    const handleLogin = async user => {
        setIsLoading(true);
        try {
            await register(user.name, user.username, newUser.phone, user.photo);
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    const render = () => {
        switch (step) {
            case 0:
                return <PhoneInputView onNext={handlePhone} />;
            case 1:
                return (
                    <SMSVerificationView
                        phone={newUser.phone}
                        onNext={handleSMS}
                        setStep={setStep}
                    />
                );
            case 2:
                return (
                    <>
                        <LoadingWrapper isLoading={isLoading}>
                            <UsernameInput onSubmit={handleVenmo} prompt={prompt} error={error} />
                        </LoadingWrapper>
                    </>
                );
            case 3:
                return (
                    <LoadingWrapper isLoading={isLoading}>
                        <Venmo
                            user={newUser}
                            onConfirm={handleLogin}
                            onDeny={handleBack}
                            isLoading={isLoading}
                        />
                    </LoadingWrapper>
                );
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

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "white",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
});

export default SignUpScreen;
