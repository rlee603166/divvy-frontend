import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigation from "./navigation/AppNavigator";

import { UserProvider, useUser } from "./services/UserProvider";
import { FriendsProvider } from "./hooks/useFriends";
import { GroupsProvider } from "./context/GroupsContext";

const RootStack = createNativeStackNavigator();

// Define a custom theme
const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "white",
        card: "white",
        text: "black",
        border: "transparent",
        primary: "black",
    },
};

export default function App() {

    const initialFriends = [];

    const initialGroups = [];

    return (
        <UserProvider>
            <FriendsProvider initialFriends={initialFriends}>
                <GroupsProvider initialGroups={initialGroups}>
                    <AppNavigation />
                </GroupsProvider>
            </FriendsProvider>
        </UserProvider>
    );
}
