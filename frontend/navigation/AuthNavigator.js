import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/NewUser/SignupScreen';
import UserInfoScreen from '../screens/NewUser/UserInfoScreen';
import SignupComplete from '../screens/NewUser/SignupComplete';
import RecommendationStart from '../screens/NewUser/RecommendationStart';
import HealthSurvey from '../screens/NewUser/HealthSurvey';
import HealthSurvey2 from '../screens/NewUser/HealthSurvey2';
import HealthSurvey3 from '../screens/NewUser/HealthSurvey3';
import InfoComplete from '../screens/NewUser/InfoComplete';
import { useRoute } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function AuthNavigator() {
    const route = useRoute();
    const initialRoute = route.params?.initialRoute || "Login"; // ✅ 초기 화면 설정

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="UserInfo" component={UserInfoScreen} />
            <Stack.Screen name="SignupComplete" component={SignupComplete} />
            <Stack.Screen name="RecommendationStart" component={RecommendationStart} />
            <Stack.Screen name="HealthSurvey" component={HealthSurvey} />
            <Stack.Screen name="HealthSurvey2" component={HealthSurvey2} />
            <Stack.Screen name="HealthSurvey3" component={HealthSurvey3} />
            <Stack.Screen name="InfoComplete" component={InfoComplete} />
        </Stack.Navigator>
    );
}
