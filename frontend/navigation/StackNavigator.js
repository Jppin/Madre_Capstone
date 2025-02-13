import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../context/AuthContext"; // ✅ AuthContext 가져오기
import CustomSpinner from "../components/CustomSpinner";

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/NewUser/SignupScreen';
import UserInfoScreen from '../screens/NewUser/UserInfoScreen';
import SignupComplete from '../screens/NewUser/SignupComplete';
import RecommendationStart from '../screens/NewUser/RecommendationStart';
import HealthSurvey from '../screens//NewUser/HealthSurvey';
import HealthSurvey2 from '../screens/NewUser/HealthSurvey2';
import HealthSurvey3 from '../screens/NewUser/HealthSurvey3';
import InfoComplete from '../screens/NewUser/InfoComplete';
import TabNavigator from './TabNavigator';
import MedicineScreen from "../screens/MedicineScreens/MedicineScreen";
import MedicineDetailScreen from "../screens/MedicineScreens/MedicineDetailScreen";

const Stack = createStackNavigator();

const StackNavigator = () => {
    const authContext = useContext(AuthContext);
    const { userData, loading } = authContext;

    if (loading) {
        return <CustomSpinner />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userData ? (
                <Stack.Screen name="Main" component={TabNavigator} />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="UserInfo" component={UserInfoScreen} />
                    <Stack.Screen name="SignupComplete" component={SignupComplete} />
                    <Stack.Screen name="RecommendationStart" component={RecommendationStart} />
                    <Stack.Screen name="HealthSurvey" component={HealthSurvey} />
                    <Stack.Screen name="HealthSurvey2" component={HealthSurvey2} />
                    <Stack.Screen name="HealthSurvey3" component={HealthSurvey3} />
                    <Stack.Screen name="InfoComplete" component={InfoComplete} />
                    <Stack.Screen name="MedicineScreen" component={MedicineScreen} options={{ title: "내 약품 보관함" }} />
                    <Stack.Screen name="MedicineDetailScreen" component={MedicineDetailScreen} options={{ title: "약품 상세 정보" }} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default StackNavigator;
