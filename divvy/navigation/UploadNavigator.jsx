import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "../screens/upload/UploadScreen";
import AdditionalCharges from "../components/upload/AdditionalCharges";

const UploadStack = createNativeStackNavigator();

export default function UploadNavigator() {
    return (
        <UploadStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <UploadStack.Screen 
                name="UploadMain" 
                component={UploadScreen}
            />
            
            <UploadStack.Screen
                name="AdditionalCharges"
                component={AdditionalCharges}
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </UploadStack.Navigator>
    );
}
