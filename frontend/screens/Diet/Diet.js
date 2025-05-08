// screens/Diet/Diet.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DietDetail from './DietDetail';







const Diet = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);



  const [mealSections, setMealSections] = useState(null);

  const parseMealSections=(text) =>{
    const sectionRegex = /\[(아침|점심|저녁|간식)\][\s\S]*?(?=\n\[|$)/g;
    const sections = {};
    let match;
  
    while ((match = sectionRegex.exec(text)) !== null) {
      const meal = match[0];
      if (meal.includes('[아침]')) sections.breakfast = meal;
      if (meal.includes('[점심]')) sections.lunch = meal;
      if (meal.includes('[저녁]')) sections.dinner = meal;
      if (meal.includes('[간식]')) sections.snack = meal;
    }
  
    return sections;
  }




  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.post("http://10.0.2.2:5001/mealplan/generate", {
          recommendList: [], // 실제 데이터로 교체
          warningList: [],
          avoidedFoods: userData.avoidedFoods || [],
          email: userData.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const fullText = res.data.result;
        const parsed = parseMealSections(fullText);
        setMealSections(parsed); // ✅ 여기
      } catch (error) {
        console.error("❌ 식단 요청 실패:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMealPlan();
  }, []);
  


  if (loading) return <LoadingScreen />;







  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="chevron-left" size={36} color="black" />
      </TouchableOpacity>

      <ScrollView 
      contentContainerStyle={styles.inner}>
        <Text style={styles.title}>{userData.nickname}님 맞춤 식단</Text>
        <Text style={styles.subtitle}>{userData.subPregnancy} 임산부를 위한 식단</Text>

        {/* 테마 카드 */}
        <View style={styles.themeCard}>
  <Image source={require('../../assets/icons/salad.png')} style={styles.themeImage} />
  
  <Text style={styles.themeTitle}>철분이 풍부한 식사</Text>
  <Text style={styles.themeDesc}>빈혈이 있는 임산부는 80~150mg의 철분을 섭취해야 해요</Text>
  <TouchableOpacity style={styles.themeButton}>
    <Text style={styles.themeButtonText}>상세 가이드 보러가기</Text>
  </TouchableOpacity>
</View>


        {/* 식사 버튼 2x2 */}
        <View style={styles.gridContainer}>
        <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate("DietDetail", {
            meal: "아침",
            content: mealSections?.breakfast || ""
            })}
        >
        <Text style={styles.gridLabel}>아침</Text>
        <Image source={require('../../assets/icons/breakfast.png')} style={styles.gridIcon1} />
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate("DietDetail", {
            meal: "점심",
            content: mealSections?.lunch || ""
        })}
        >
        <Text style={styles.gridLabel}>점심</Text>
        <Image source={require('../../assets/icons/lunch.png')} style={styles.gridIcon2} />
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate("DietDetail", {
            meal: "저녁",
            content: mealSections?.dinner || ""
        })}
        >
        <Text style={styles.gridLabel}>저녁</Text>
        <Image source={require('../../assets/icons/dinner.png')} style={styles.gridIcon3} />
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate("DietDetail", {
            meal: "간식",
            content: mealSections?.snack || ""
        })}
        >
        <Text style={styles.gridLabel}>간식</Text>
        <Image source={require('../../assets/icons/cookie.png')} style={styles.gridIcon4} />
        </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.refreshButton}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Feather name="rotate-ccw" size={20} color="#333" />
        <Text style={{ marginLeft: 6, fontSize: 14, color: '#333' }}>다시 생성</Text>
        </View>

        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6DE',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
  },
  inner: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20, // ✅ 이걸로 전체 하단 여백 확보
    flexGrow: 1,
},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#215132',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: -12,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  themeCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop : 16,
  },
  themeDesc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  themeButton: {
    backgroundColor: '#B6D7A8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  themeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  themeImage: {
    position: 'absolute', // ✅ 추가
    top: 8,              // ✅ 상단 여백
    right: 8,            // ✅ 우측 여백
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    backgroundColor: '#FFFBF2',
    width: '48%',
    height:120,
    borderRadius: 20,
    marginBottom: 10,
    padding: 14, 
    position: 'relative', 
  },
  gridIcon1: {
    position: 'absolute', // ✅ 오버레이
    right: 12,            // ✅ 오른쪽 여백
    top: '70%',           // ✅ 수직 중앙 위치
    transform: [{ translateY: -24 }], // ✅ 중앙 정렬 보정 (아이콘 높이 절반만큼 위로)
    width: 45,
    height: 60,
    marginBottom: 8,
    marginRight: 20,
    resizeMode: 'contain',
  },
  gridIcon2: {
    position: 'absolute', // ✅ 오버레이
    right: 12,            // ✅ 오른쪽 여백
    top: '80%',           // ✅ 수직 중앙 위치
    transform: [{ translateY: -24 }], // ✅ 중앙 정렬 보정 (아이콘 높이 절반만큼 위로)
    width: 90,
    height: 50,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  
  gridIcon3: {
    position: 'absolute', // ✅ 오버레이
    right: 12,            // ✅ 오른쪽 여백
    top: '80%',           // ✅ 수직 중앙 위치
    transform: [{ translateY: -24 }], // ✅ 중앙 정렬 보정 (아이콘 높이 절반만큼 위로)
    width: 90,
    height: 55,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  gridIcon4: {
    position: 'absolute', // ✅ 오버레이
    right: 12,            // ✅ 오른쪽 여백
    top: '60%',           // ✅ 수직 중앙 위치
    transform: [{ translateY: -24 }], // ✅ 중앙 정렬 보정 (아이콘 높이 절반만큼 위로)
    width: 84,
    height: 90,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  gridLabel: {
    fontSize: 20,
    fontWeight: 'bold', // ✅ 볼드
    color: '#333',
    marginRight: 6,      // ✅ 이미지와 간격 (gap 안되면 사용)
    textAlign: 'left', 
},
  refreshButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Diet;
