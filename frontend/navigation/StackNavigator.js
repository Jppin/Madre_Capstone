import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import UserInfoScreen from '../screens/UserInfoScreen';
import SignupComplete from '../screens/SignupComplete';  // ✅ 추가
import RecommendationStart from '../screens/RecommendationStart';  // ✅ 추가
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const StackNavigator = () => {
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            // ✅ 앱 실행 시 항상 로그인 화면이 먼저 뜨도록 userToken 삭제
            await AsyncStorage.removeItem('userToken');

            // ✅ 0.5초 딜레이 후 로그인 화면 표시
            setTimeout(() => setIsChecking(false), 500);
        };
        initializeApp();
    }, []);

    // ✅ 로딩 중일 때 보여줄 화면 (UI 깔끔하게 하기 위해 추가)
    if (isChecking) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FBAF8B" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="UserInfo" component={UserInfoScreen} />
                <Stack.Screen name="SignupComplete" component={SignupComplete} />
                <Stack.Screen name="RecommendationStart" component={RecommendationStart} />
                <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default StackNavigator;
