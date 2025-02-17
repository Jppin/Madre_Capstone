//AppNavigator.js

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import CustomSpinner from '../components/CustomSpinner';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { userData, loading, isNewUser } = useContext(AuthContext);

    if (loading) {
        return <CustomSpinner />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userData ? (
                    isNewUser ? (
                        // ✅ AuthNavigator에서 'UserInfo' 화면을 기본값으로 설정
                        <Stack.Screen name="Auth">
                            {() => <AuthNavigator initialRoute="UserInfo" />}
                        </Stack.Screen>
                    ) : (
                        <Stack.Screen name="MainNavigator" component={MainNavigator} />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
