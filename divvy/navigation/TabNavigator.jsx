import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import HomeNavigator from "./HomeNavigator";
import ProfileNavigator from "./ProfileNavigation";
import UploadScreen from "../screens/upload/UploadScreen";
import theme from "../theme/index.js";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function TabNavigator() {
    const navigation = useNavigation();
    
    return (
        <Tab.Navigator
            initialRouteName="HomeNavigator"
            screenOptions={({ route }) => ({
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarStyle: {
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeNavigator"
                component={HomeNavigator}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Upload"
                component={EmptyComponent}
                listeners={{
                    tabPress: (e) => {
                        // Prevent default action
                        e.preventDefault();
                        // Navigate to modal
                        navigation.navigate('UploadModal');
                    },
                }}
                options={{
                    tabBarLabel: "Upload",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "add-circle" : "add-circle-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileNavigator"
                component={ProfileNavigator}
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const EmptyComponent = () => null;

export default TabNavigator;
