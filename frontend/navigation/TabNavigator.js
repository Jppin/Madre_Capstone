//TabNavigator.js


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import NewHomeScreen from '../screens/Home/NewHomeScreen';
import MedicineNavigator from "./MedicineNavigator";
import YoutubeScreen from '../screens/Youtube/YoutubeScreen';



const Tab = createBottomTabNavigator();

// **커스텀 하단 탭 바**
const CustomTabBar = ({ state, navigation }) => {
  return (
    <View style={styles.shadowWrapper}>
    <View style={styles.tabBarContainer}>
    {state.routes.map((route, index) => {
      const isFocused = state.index === index;
  
      let iconSource;
      switch (route.name) {
        case 'Home':
          iconSource = require('../assets/icons/logo2.png');
          break;
        case 'Medicine':
          iconSource = require('../assets/icons/medicine.png');
          break;
        case 'Youtube':
          iconSource = require('../assets/icons/youtube.png');
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
  
      const isHome = route.name === 'Home';
  
      return (
        <TouchableOpacity
          key={route.key}
          onPress={onPress}
          style={[
            isHome ? styles.homeTabItem : styles.tabItem,
            !isHome && isFocused && styles.activeTab, // ✅ 여기서 다시 적용!
          ]}
        >
          {/* ✅ 활성화된 홈 탭이면 배경 박스를 따로 렌더링 */}
          {isFocused && isHome && (
            <View style={styles.homeActiveBackground} />
          )}

          <View style={isHome ? styles.homeIconWrapper : null}>
            <Image
              source={iconSource}
              style={[styles.iconStyle, isHome && styles.homeIcon]}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              isFocused && styles.activeLabel,
              isHome && styles.homeLabel,
            ]}
          >
            {route.name === 'Home' ? '홈' : route.name === 'Medicine' ? '약품 보관함' : '건강 쇼츠'}
          </Text>
        </TouchableOpacity>

      );
    })}
  </View>
  </View>
  );
};

const TabNavigator = () => {
  return (
    <View style={styles.container}>
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Medicine" component={MedicineNavigator} options={{ tabBarLabel: "약품 보관함" }} />
      <Tab.Screen name="Home" component={NewHomeScreen} options={{ tabBarLabel: '케어 센터' }} />
      <Tab.Screen name="Youtube" component={YoutubeScreen} options={{ tabBarLabel: '건강 쇼츠' }} />
    </Tab.Navigator>
    </View>
  );
};

// **스타일 개선**
const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'transparent',
  },

  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    height: 70,
    width: 270,
    
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20, // Android 전용 그림자
    shadowColor: '#000', // iOS도 같이 켜둠
    zIndex: 999,
    
  },
  
  shadowWrapper: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: 'transparent', // ✅ 투명해야 바탕 그대로
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  

  homeTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -20, // 위로 살짝 올라오게
    zIndex: 10,
    width: 80,
    
  },

  homeIconWrapper: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },

  homeIcon: {
    width: 50,
    height: 50,
  },

  homeLabel: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  
  activeLabel: {
    color: '#111',
    fontWeight: 'bold',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#E0E0E0', // 활성 탭 배경색
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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

  homeActiveBackground: {
    position: 'absolute',
    top: 12,
    width: 80,
    height: 100,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: -1,
  },
  

});

export default TabNavigator;
