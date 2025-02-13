//AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../context/AuthContext';
import CustomSpinner from '../components/CustomSpinner';

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
                        <Stack.Screen name="Auth" component={AuthNavigator} initialParams={{ initialRoute: "UserInfo" }} />
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
