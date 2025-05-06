import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'react-native-linear-gradient';
import { StatusBar } from "react-native";
import {useNavigation} from '@react-navigation/native';
import Feather from "react-native-vector-icons/Feather"
import createAPI from '../../api';

const NutrientDetail = ({ route }) => {
  const { nutrient, info, usage, precaution } = route.params;
  const navigation = useNavigation();
  const [likedNutrients, setLikedNutrients] = useState({});
  const [detailInfo, setDetailInfo] = useState(null);





  useEffect(() => {
    const fetchLikedNutrients = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const api = await createAPI();
        const { data } = await api.get("/nutrient/likes", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const likesMap = {};
        data.likedNutrients.forEach((name) => {
          likesMap[name] = true;
        });
        setLikedNutrients(likesMap);
      } catch (error) {
        console.error("찜 데이터 불러오기 실패:", error);
      }
    };

    const fetchDetail = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const api = await createAPI();
        const res = await api.get(`/nutrient/detail/${encodeURIComponent(nutrient)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetailInfo(res.data);
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      }
    };




    fetchLikedNutrients();
    fetchDetail();  
  }, []);
  
 






    const toggleLike = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const api = await createAPI();

    console.log("🔍 토글 요청 nutrient 이름:", nutrient); // 🔹 여기에 추가

    const isLiked = likedNutrients[nutrient];

    if (isLiked) {
      await api.post("/nutrient/unlike", { nutrientName: nutrient }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await api.post("/nutrient/like", { nutrientName: nutrient }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // 상태 업데이트
    setLikedNutrients(prev => ({
      ...prev,
      [nutrient]: !prev[nutrient],
    }));
  } catch (err) {
    console.error("찜 토글 실패:", err);
  }
};

  
  
 

   

  return (
    <View style={styles.container}>
      {/* ✅ 배경 Gradient */}
      <StatusBar barStyle="light-content" backgroundColor="#F6EBC9" />
      <LinearGradient colors={["#F6EBC9", "#FFF"]} locations={[0, 1]} style={styles.background}/>
      
      {/*하단반원 추가 */ }
      <LinearGradient 
        colors={["#C2DFBF", "#FFF"]} // ✅ 하단 원의 그라디언트 색상
        style={styles.circle} 
        locations={[0, 1]}
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
            <Feather name="chevron-left" size={40} color="white" />
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

        {detailInfo && (
  <>
    <View style={styles.separator} />
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>• 영양성분 설명</Text>
      <Text style={styles.sectionText}>{detailInfo.info}</Text>
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>• 섭취 방법</Text>
      <Text style={styles.sectionText}>{detailInfo.usage}</Text>
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>• 복용 시 주의사항</Text>
      <Text style={styles.sectionText}>{detailInfo.precaution}</Text>
    </View>
  </>
)}

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
    left: 1,
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
    borderTopRightRadius: 100,
    borderTopLeftRadius : 100,
    backgroundColor: "#C2DFBF", // ✅ 원 색상
    
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
    marginLeft : 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc", // ✅ 회색 불투명 선
    marginTop: 12,
  marginBottom: 16,
  },
  content: {
    fontSize: 14,
    color: "gray",
    marginTop: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  
}); 
export default NutrientDetail; 