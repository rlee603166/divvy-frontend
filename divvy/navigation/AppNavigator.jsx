import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "../screens/upload/UploadScreen";
import SnapTab from "./SnapTab";
import TabNavigator from "./TabNavigator";
import UploadNavigator from "./UploadNavigator";
import ContactList from "../components/main/ContactList";
import AuthNavigator from "./AuthNavigator";
import { useUser } from "../services/UserProvider";
import { useFriends } from "../hooks/useFriends";

const App = createNativeStackNavigator();

export default function AppNavigation() {
    const { isAuthenticated } = useUser();
    const { friends, isLoading, error, addFriend } = useFriends();

    return (
        <NavigationContainer>
            <App.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <App.Screen name="Main" component={AuthNavigator} />
                ) : (
                    <>
                        <App.Screen name="Auth" component={TabNavigator} />
                        <App.Screen
                            name="UploadModal"
                            component={UploadScreen}
                            options={{
                                presentation: "fullScreenModal",
                                animation: "default",
                                animationDuration: 300,
                                animationTypeForReplace: "push",
                                gestureEnabled: true,
                                gestureDirection: "vertical",
                            }}
                        />
                    </>
                )}
            </App.Navigator>
        </NavigationContainer>
    );
}
