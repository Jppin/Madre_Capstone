import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CustomSpinner 컴포넌트 가져오기
import CustomSpinner from '../components/CustomSpinner';

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

const Stack = createStackNavigator();

const StackNavigator = () => {
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            await AsyncStorage.removeItem('userToken');
            setTimeout(() => setIsChecking(false), 500);
        };
        initializeApp();
    }, []);

    // ✅ 로딩 중일 때 CustomSpinner 사용
    if (isChecking) {
        return <CustomSpinner />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="UserInfo" component={UserInfoScreen} />
                <Stack.Screen name="SignupComplete" component={SignupComplete} />
                <Stack.Screen name="RecommendationStart" component={RecommendationStart} />
                <Stack.Screen name="HealthSurvey" component={HealthSurvey} />
                <Stack.Screen name="HealthSurvey2" component={HealthSurvey2} />
                
                <Stack.Screen name="HealthSurvey3" component={HealthSurvey3} />
                <Stack.Screen name="InfoComplete" component={InfoComplete} />
                <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigator;
