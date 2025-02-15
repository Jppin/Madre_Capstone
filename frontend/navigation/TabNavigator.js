//TabNavigator.js


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MedicineNavigator from "./MedicineNavigator";
import NutritionScreen from '../screens/NutritionScreen';
import YoutubeScreen from '../screens/YoutubeScreen';
import MyPageScreen from "../screens/MyPage/MyPageScreen";;


const Tab = createBottomTabNavigator();

// **커스텀 하단 탭 바**
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

        // 아이콘 설정
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
            style={[styles.tabItem, isFocused && styles.activeTab]}
            onPress={onPress}
          >
            <Image source={iconSource} style={[styles.iconStyle, isFocused && styles.activeIcon]} />
            <Text style={[styles.tabLabel, isFocused && styles.activeLabel]}>{label}</Text>
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
      initialRouteName="Home"
    >
      <Tab.Screen name="Medicine" component={MedicineNavigator} options={{ tabBarLabel: "약품 보관함" }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: '성분 추천 내역' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '케어 센터' }} />
      <Tab.Screen name="Youtube" component={YoutubeScreen} options={{ tabBarLabel: '건강 쇼츠' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이페이지' }} />
    </Tab.Navigator>
  );
};

// **스타일 개선**
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8', // 밝은 그레이톤
    height: 70, // 높이 조정
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    elevation: 5, // 안드로이드 그림자
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#E0E0E0', // 활성 탭 배경색
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeLabel: {
    fontSize: 12,
    color: '#333', // 활성화 시 진한 색상
    fontWeight: 'bold',
  },
  iconStyle: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    opacity: 0.6, // 비활성화 아이콘 투명도 조정
  },
  activeIcon: {
    opacity: 1, // 활성화 시 선명하게
  },
});

export default TabNavigator;
