import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigation from "./navigation/AppNavigator";

import { UserProvider, useUser } from "./services/UserProvider";

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

    return (
        <UserProvider>
            <AppNavigation />
        </UserProvider>
    );
}
