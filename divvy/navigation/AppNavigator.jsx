import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "../screens/upload/UploadScreen";
import TabNavigator from "./TabNavigator";
import AuthNavigator from "./AuthNavigator";
import UploadNavigator from "./UploadNavigator";
import { useUser } from "../services/UserProvider";
import { FriendsProvider } from "../hooks/useFriends";
import { GroupsProvider } from "../context/GroupsContext";

const App = createNativeStackNavigator();

// Create a wrapper component for authenticated screens
const AuthenticatedScreens = () => {
    return (
        <FriendsProvider initialFriends={[]}>
            <GroupsProvider initialGroups={[]}>
                <App.Navigator screenOptions={{ headerShown: false }}>
                    <App.Screen name="Tab" component={UploadNavigator} />
                </App.Navigator>
            </GroupsProvider>
        </FriendsProvider>
    );
};

export default function AppNavigation() {
    const { isAuthenticated } = useUser();

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <AuthenticatedScreens />
            ) : (
                <App.Navigator screenOptions={{ headerShown: false }}>
                    <App.Screen name="Auth" component={AuthNavigator} />
                </App.Navigator>
            )}
        </NavigationContainer>
    );
}
