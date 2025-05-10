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
  const [themeData, setThemeData] = useState({ theme: '', description: '' });
  const [fullText, setFullText] = useState('');





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





  const parseThemeSection = (text) => {
    const themeMatch = text.match(/\[식단 테마\][\s\S]*?(?=\n\[|$)/);
    if (!themeMatch) return { theme: '', description: '' };
  
    const section = themeMatch[0];
    const themeLine = section.match(/- 테마:\s*(.*)/);
    const descLine = section.match(/- 테마 설명:\s*(.*)/);
  
    return {
      theme: themeLine ? themeLine[1].trim() : '',
      description: descLine ? descLine[1].trim() : ''
    };
  };
  




  const fetchMealPlan = async () => {
    setLoading(true);
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
      const parsedTheme = parseThemeSection(fullText);
      setMealSections(parsed);
      setThemeData(parsedTheme);
      setFullText(fullText); // 이걸 저장하고...
      
    } catch (error) {
      console.error("❌ 식단 요청 실패:", error);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    
  
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
        {/* 제목 + 이미지 row */}
        <View style={styles.themeHeaderRow}>
            <Text style={styles.themeTitle}>{themeData.theme || '오늘의 건강 테마'}</Text>
            <Image source={require('../../assets/icons/salad.png')} style={styles.themeImage} />
        </View>

        {/* 설명 + 버튼 */}
        <Text style={styles.themeDesc}>{themeData.description || 'AI가 분석한 나만의 건강 포인트!'}</Text>
        <TouchableOpacity style={styles.themeButton} onPress={() => navigation.navigate("Guide", { guideText: fullText })}>
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
        <Text style={styles.refreshButtonText}>다시 생성</Text>
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
