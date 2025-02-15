import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MyPageScreen from "../screens/MyPage/MyPageScreen";


const Stack = createStackNavigator();

export default function MyPageNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* ✅ 마이페이지 메인 화면 */}
            <Stack.Screen name="MyPageMain" component={MyPageScreen} />
            
        </Stack.Navigator>
    );
}
