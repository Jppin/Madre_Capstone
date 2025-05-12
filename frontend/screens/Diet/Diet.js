// screens/Diet/Diet.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DietDetail from './DietDetail';
import createAPI from '../../api';
import { useRoute } from '@react-navigation/native';




const Diet = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const route = useRoute();
  const mealPlan = route.params?.mealPlan;

  const [loading, setLoading] = useState(true);
  const [mealSections, setMealSections] = useState({});
  const [themeData, setThemeData] = useState({});
  const [summary, setSummary] = useState({});
  const [fullText, setFullText] = useState("");


  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();

      const res = await api.post("/mealplan/generate", {
        recommendList: [],
        warningList: [],
        avoidedFoods: userData.avoidedFoods || [],
        email: userData.email,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const generatedMealPlan = res.data; // 이게 구조화된 응답이어야 함
      setMealSections({
        breakfast: generatedMealPlan.breakfast,
        lunch: generatedMealPlan.lunch,
        dinner: generatedMealPlan.dinner,
        snack: generatedMealPlan.snack,
      });
      setThemeData({
        theme: generatedMealPlan.dailyGuide.theme,
        description: generatedMealPlan.dailyGuide.themeComment,
      });
      setSummary(generatedMealPlan.dailyGuide);
      setFullText(generatedMealPlan.llmResult);
    } catch (error) {
      console.error("❌ 식단 요청 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mealPlan) {
      setMealSections({
        breakfast: mealPlan.breakfast,
        lunch: mealPlan.lunch,
        dinner: mealPlan.dinner,
        snack: mealPlan.snack,
      });
      setThemeData({
        theme: mealPlan.dailyGuide.theme,
        description: mealPlan.dailyGuide.themeComment,
      });
      setSummary(mealPlan.dailyGuide);
      setFullText(mealPlan.llmResult);
      setLoading(false);
    } else {
      fetchMealPlan();
    }
  }, []);


  if (loading) return <LoadingScreen/>;


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
        {/* 제목 + 이미지 row */}
        <View style={styles.themeHeaderRow}>
            <Text style={styles.themeTitle}>{themeData.theme || '오늘의 건강 테마'}</Text>
            <Image source={require('../../assets/icons/salad.png')} style={styles.themeImage} />
        </View>

        {/* 설명 + 버튼 */}
        <Text style={styles.themeDesc}>{themeData.description || 'AI가 분석한 나만의 건강 포인트!'}</Text>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={() =>
            navigation.navigate("Guide", {
              summary,          // already structured: nutrientFulfillment, supplements, precautions
              guideText: fullText,  // if you still want to display raw text somewhere
            })
          }
        >
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

        <TouchableOpacity  onPress={fetchMealPlan}>
        <View style={styles.refreshButtonContent}>
        <Feather name="rotate-ccw" size={20} color="#333" />
        <Text style={styles.refreshButtonText}> 다시 생성</Text>
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
  },
  themeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // 설명과 간격
  },
  themeContent: {
    flex: 1,
    paddingRight: 12, // 이미지와 여백 확보
  },
  themeImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1, // 남은 공간 차지
    marginRight: 12,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#B6D7A8',
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  
  refreshButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Diet;
