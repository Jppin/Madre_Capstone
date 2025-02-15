//MainNavigator.js


import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import CameraScreen from '../screens/MedicineScreens/CameraScreen';
import GalleryScreen from '../screens/MedicineScreens/GalleryScreen';
import ManualEntryScreen from '../screens/MedicineScreens/ManualEntryScreen';
import MedicineDetailScreen from "../screens/MedicineScreens/MedicineDetailScreen";
import MyPageNavigator from "./MyPageNavigator";
import MyPageScreen from '../screens/MyPage/MyPageScreen';
import NameAgeEdit from "../screens/MyPage/NameAgeEdit";



const Stack = createStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* ✅ 메인 탭 네비게이터 */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* ✅ 개별 화면으로 추가해야 함 (Navigator 자체를 스크린으로 넣으면 안됨) */}
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="GalleryScreen" component={GalleryScreen} />
            <Stack.Screen name="ManualEntryScreen" component={ManualEntryScreen} />
            <Stack.Screen name="MedicineDetailScreen" component={MedicineDetailScreen} options={{ tabBarStyle: { display: 'none' } }}/>
            <Stack.Screen name="MyPageNavigator" component={MyPageNavigator} /> 
            <Stack.Screen name="MyPage" component={MyPageScreen} />
            <Stack.Screen name="NameAgeEdit" component={NameAgeEdit} />
        </Stack.Navigator>
    );
}
