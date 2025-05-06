import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../../context/AuthContext';
import CustomSpinner from "../../components/CustomSpinner";
import createAPI from '../../api';


const LikedNutrientsScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [likedOnly, setLikedOnly] = useState({});
  const [loading, setLoading] = useState(true); // 🔸 로딩 상태 추가

  useEffect(() => {
    const fetchLiked = async () => {
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();
      const { data } = await api.get("/nutrient/likes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nutrientMap = {};
      data.likedNutrients.forEach((name) => {
        nutrientMap[name] = true;
      });
      setLikedOnly(nutrientMap);
    };

    const fetchRecommendations = async () => {
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();
      const { data } = await api.get("/nutrient/personal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const combined = [];

      if (data.recommendList) {
        data.recommendList.forEach((item) =>
          combined.push({
            name: item.name,
            effect: item.effect,
            type: "추천",
            concern: item.concern, // ✅ 여기!
          })
        );
      }
    
      if (data.warningList) {
        data.warningList.forEach((item) =>
          combined.push({
            name: item.name,
            effect: item.effect,
            type: "주의",
            concern: item.concern, // ✅ 여기!
          })
        );
      }

      setAllRecommendations(combined);
    };

    const loadAll = async () => {
      await Promise.all([fetchLiked(), fetchRecommendations()]);
      setLoading(false); // 🔸 데이터 다 불러온 후 로딩 false
    };

    loadAll();
  }, []);

  const merged = {};
  allRecommendations.forEach(({ name, effect, type, concern }) => {
    if (likedOnly[name]) {
      if (!merged[name]) {
        merged[name] = {
          name,
          types: {
            추천: { reasons: [], concerns: [] },
            주의: { reasons: [], concerns: [] }
          }
        };
      }
  
      // 추천 or 주의 추가
      if (effect && !merged[name].types[type].reasons.includes(effect)) {
        merged[name].types[type].reasons.push(effect);
      }
  
      if (concern && !merged[name].types[type].concerns.includes(concern)) {
        merged[name].types[type].concerns.push(concern);
      }
    }
  });
  
  const likedList = Object.values(merged);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Login");
            }
          }}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY 영양성분</Text>
      </View>

      {loading ? (
  <View style={styles.spinnerWrapper}>
    <CustomSpinner />
  </View>
) : likedList.length === 0 ? (
  <Text style={styles.emptyText}>찜한 영양소가 없습니다.</Text>
) : (
  <View>
    <Text style={styles.topText}>💖 내가 찜한 영양성분들이에요! 💖</Text>

    {likedList.map((item, idx) => (
  <View key={idx} style={styles.card}>
    <View style={styles.cardHeader}>
      <Image
        source={require("../../assets/icons/thumbsup.png")}
        style={styles.icon}
      />
      <Text style={styles.nutrientTitle}>{item.name}</Text>
    </View>

    {item.types.추천.reasons.length > 0 && (
      <>
        <Text style={styles.concernLabel}>
          관련 건강 문제/관심사 (추천): {item.types.추천.concerns.join(", ") || "정보 없음"}
        </Text>
        <Text style={styles.reasonLabel}>추천 이유</Text>
        {item.types.추천.reasons.map((r, i) => (
          <Text key={i} style={styles.reasonText}>• {r}</Text>
        ))}
      </>
    )}


    {/* 추천과 비추천 사이 여백 */}
    {item.types.추천.reasons.length > 0 && item.types.주의.reasons.length > 0 && (
      <View style={{ marginVertical: 10 }} />
    )}



    {/* 비추천 섹션 */}
    {item.types.주의.reasons.length > 0 && (
      <>
        <View style={styles.cardHeader}>
          <Image
            source={require("../../assets/icons/thumbsdown.png")}
            style={styles.icon}
          />
          <Text style={styles.nutrientTitle2}>{item.name}</Text>
        </View>
        <Text style={styles.concernLabel}>
          관련 건강 문제/관심사 (주의): {item.types.주의.concerns.join(", ") || "정보 없음"}
        </Text>
        <Text style={styles.reasonLabel}>비추천 이유</Text>
        {item.types.주의.reasons.map((r, i) => (
          <Text key={`warn-${i}`} style={styles.reasonText}>• {r}</Text>
        ))}
      </>
    )}
  </View>
))}
  </View> 
)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#FBAF8B',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 10,
    
  },
  concernText: {
    fontSize: 13,
    color: '#117389',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888'
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: -5,
    marginHorizontal: 20,
    marginTop: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  nutrientTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F15A24',
  },
  concernLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#117389',
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  spinnerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 300, // 🔹 header에 가리지 않도록 조정
  },
  topText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FBAF8B',
    marginHorizontal: 20,
    marginTop: 15,
    textAlign: 'center',
  },
  nutrientTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  warningCard: {
    backgroundColor: '#FDECEC', // 연한 분홍빛 배경
  },
  
  
});

export default LikedNutrientsScreen;
