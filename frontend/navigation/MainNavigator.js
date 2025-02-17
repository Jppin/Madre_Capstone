//MainNavigator.js


import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CameraScreen from '../screens/MedicineScreens/CameraScreen';
import GalleryScreen from '../screens/MedicineScreens/GalleryScreen';
import ManualEntryScreen from '../screens/MedicineScreens/ManualEntryScreen';
import MedicineDetailScreen from "../screens/MedicineScreens/MedicineDetailScreen";
import AlcoholSmoking from "../screens/MyPage/AlcoholSmoking";
import ConcernsEdit from '../screens/MyPage/ConcernsEdit';
import ConditionsEdit from '../screens/MyPage/ConditionsEdit';
import NameAgeEdit from "../screens/MyPage/NameAgeEdit";
import TabNavigator from './TabNavigator';


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
            <Stack.Screen name="NameAgeEdit" component={NameAgeEdit} />
            <Stack.Screen name="AlcoholSmoking" component={AlcoholSmoking} />
            <Stack.Screen name="ConditionsEdit" component={ConditionsEdit} />
            <Stack.Screen name="ConcernsEdit" component={ConcernsEdit}/>
        
        
        </Stack.Navigator>
    );
}
