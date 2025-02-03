// navigation/TabNavigator.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MedicineScreen from '../screens/MedicineScreen';
import NutritionScreen from '../screens/NutritionScreen';
import YoutubeScreen from '../screens/YoutubeScreen';
import MyPageScreen from '../screens/MyPageScreen';

const Tab = createBottomTabNavigator();

// 커스텀 하단 탭 바 컴포넌트///으으 다시시
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // 각 탭별 단일 아이콘 이미지 사용////으아아아아아아
        let iconSource;
        switch (route.name) {
          case 'Home':
            iconSource = require('../assets/icons/home.png');
            break;
          case 'Medicine':
            iconSource = require('../assets/icons/medicine.png');
            break;
          case 'Nutrition':
            iconSource = require('../assets/icons/nutrition.png');
            break;
          case 'Youtube':
            iconSource = require('../assets/icons/youtube.png');
            break;
          case 'MyPage':
            iconSource = require('../assets/icons/mypage.png');
            break;
          default:
            break;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.tabItem,
              index !== state.routes.length - 1 && styles.borderRight,
              isFocused && styles.activeTabItem, // active 상태면 추가 스타일 적용
            ]}
            onPress={onPress}
          >
            <Image source={iconSource} style={styles.iconStyle} />
            <Text style={[styles.tabLabel, { color: isFocused ? '#000' : '#999' }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Medicine" component={MedicineScreen} options={{ tabBarLabel: '약품 보관함' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: '영양성분 추천' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '케어 센터' }} />
      <Tab.Screen name="Youtube" component={YoutubeScreen} options={{ tabBarLabel: '유튜브 쇼츠' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이페이지' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff', // 하단 바 배경색
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  activeTabItem: {
    backgroundColor: '#eee', // active 상태일 때 연한 회색 배경
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  iconStyle: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default TabNavigator;
