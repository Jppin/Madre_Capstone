import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'react-native-linear-gradient';
import { StatusBar } from "react-native";
import {useNavigation} from '@react-navigation/native';
import Feather from "react-native-vector-icons/Feather"

const NutrientDetail = ({ route }) => {
  const { nutrient } = route.params;
  const navigation = useNavigation();
  const [likedNutrients, setLikedNutrients] = useState({});

   // ✅ AsyncStorage에서 likedNutrients 불러오기
   useEffect(() => {
    const fetchLikedNutrients = async () => {
      try {
        const storedLikes = await AsyncStorage.getItem("liked_nutrients");
        setLikedNutrients(storedLikes ? JSON.parse(storedLikes) : {});
      } catch (error) {
        console.error("좋아요 데이터 불러오기 오류:", error);
      }
    };
    fetchLikedNutrients();
  }, []);
 
    // ✅ 하트 버튼 토글 함수 (HomeScreen과 동일한 로직)
    const toggleLike = async () => {
      setLikedNutrients(prev => {
        const updatedLikes = { ...prev, [nutrient]: !prev[nutrient] };
        AsyncStorage.setItem("liked_nutrients", JSON.stringify(updatedLikes));
        return updatedLikes;
      });
    };
  
  
 

   

  return (
    <View style={styles.container}>
      {/* ✅ 배경 Gradient */}
      <StatusBar barStyle="light-content" backgroundColor="#6A5ACD" />
      <LinearGradient colors={["#6A5ACD", "#A9D046"]} style={styles.background}/>
      
      {/*하단반원 추가 */ }
      <LinearGradient 
        colors={["#A9D046", "#E2F79F"]} // ✅ 하단 원의 그라디언트 색상
        style={styles.circle} 
        start={{ x: 0.5, y: 0 }} // ✅ 그라디언트 방향 (위 -> 아래)
        end={{ x: 0.5, y: 1 }} 
      />
 
  
      <TouchableOpacity 
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
           navigation.navigate("홈스크린이름"); // ✅ 홈 화면으로 이동 (필요시 변경)
         }
         }} 
         style={styles.backButton}
>
            <Feather name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>
       
     {/* ✅ 영양소 상세 카드 */}
     <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{nutrient}</Text>
          {/* ✅ 하트 버튼 (HomeScreen과 같은 기능) */}
          <TouchableOpacity onPress={toggleLike} style={styles.heartButton}>
            <Icon 
              name={likedNutrients[nutrient] ? 'heart' : 'heart-outline'} 
              size={26} 
              color="red" 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.content}>영양성분에 대한 상세설명을 입력하시오</Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
},
heartButton: {
  padding: 5, // ✅ 터치 영역 확장
},

  background: {
    ...StyleSheet.absoluteFillObject, // ✅ 전체 배경 적용
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    bottom: 0, // ✅ 하단에 배치
    left: -50, // ✅ 좌우 여백 조정
    right: -50,
    width: "120%",
    height: 440, // ✅ 원의 크기 조정
    borderTopLeftRadius: 100, // ✅ 반원 효과
    borderTopRightRadius: 100,
    borderTopLeftRadius : 100,
    backgroundColor: "#A9D046", // ✅ 원 색상
    
  },
  card: {
    backgroundColor: "white",
    width: 350,
    height: "80%",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: { 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(87, 20, 20, 0)", // ✅ 회색 불투명 선
    marginVertical: 10,
  },
  content: {
    fontSize: 14,
    color: "gray",
    marginTop: 20,
  },
}); 
export default NutrientDetail; 