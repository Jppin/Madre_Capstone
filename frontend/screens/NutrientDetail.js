import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import  Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'react-native-linear-gradient';

  const NutrientDetail = ({ route }) => {
  const { nutrient } = route.params;
  const [likedNutrients, setLikedNutrients] = useState({});

  // 좋아요 한 영양성분 저장 
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
  }, []) ; 
  
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
      <LinearGradient colors={["#6A5ACD", "#98FB98"]} style={styles.background}>
        <View style={styles.greenCircle} />
        <View style={styles.blueCircle} />
      </LinearGradient>

     
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{nutrient}</Text>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <Text style={styles.content}>영양성분에 대한 상세설명을 입력하시오</Text>
      </View>
  
  

        {/* ✅ 회색 불투명한 선 */}
        <View style={styles.separator} />

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
  background: {
    ...StyleSheet.absoluteFillObject, // ✅ 전체 배경 적용
    alignItems: "center",
    justifyContent: "center",
  },
  greenCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(152, 251, 152, 0.5)", // ✅ 연한 초록색 반투명 원
    bottom: -100,
  },
  blueCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(106, 90, 205, 0.5)", // ✅ 연한 파란색 반투명 원
    top: -50,
  },
  card: {
    backgroundColor: "white",
    width: "85%",
    height: "65%",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.4)", // ✅ 회색 불투명 선
    marginVertical: 10,
  },
  content: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
  },
}); 
export default NutrientDetail; 