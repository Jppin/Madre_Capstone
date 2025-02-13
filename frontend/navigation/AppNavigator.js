//AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../context/AuthContext';
import CustomSpinner from '../components/CustomSpinner';
import { createStackNavigator } from '@react-navigation/stack';
import UserInfoScreen from '../screens/NewUser/UserInfoScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { userData, loading, isNewUser } = useContext(AuthContext);

    if (loading) {
        return <CustomSpinner />;
    }

    return (
        <NavigationContainer>
            {userData ? (
                isNewUser ? (
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="UserInfo" component={UserInfoScreen} />
                    </Stack.Navigator>
                ) : (
                    <MainNavigator />
                )
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}
