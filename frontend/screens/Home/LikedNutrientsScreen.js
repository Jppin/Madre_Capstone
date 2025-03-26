// LikedNutrientsScreen.js (새 코드 - 카드 형태 적용 및 이유/아이콘 표시)

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../../context/AuthContext';

const LikedNutrientsScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [likedNutrients, setLikedNutrients] = useState({});
  const [likedOnly, setLikedOnly] = useState({});



  useEffect(() => {
    const fetchLiked = async () => {
      const token = await AsyncStorage.getItem("token");
  
      const res = await fetch("http://10.0.2.2:5001/api/liked-nutrients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const json = await res.json();
      const nutrientMap = {};
      json.likedNutrients.forEach((name) => {
        nutrientMap[name] = true;
      });
  
      setLikedOnly(nutrientMap);
    };
  
    fetchLiked();
  }, []);




  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch("http://10.0.2.2:5001/nutrient-recommendations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
  
      const combined = [];
  
      if (json.recommendList) {
        json.recommendList.forEach((item) => {
          combined.push({ name: item.name, effect: item.effect, type: "추천" });
        });
      }
  
      if (json.warningList) {
        json.warningList.forEach((item) => {
          combined.push({ name: item.name, effect: item.effect, type: "주의" });
        });
      }
  
      setAllRecommendations(combined);
    };
  
    fetchRecommendations();
  }, []);



  

  const merged = {};
  allRecommendations.forEach(({ name, effect, type }) => {
    if (likedOnly[name]) {
      if (!merged[name]) {
        merged[name] = {
          name,
          reasons: [effect],
          type,
        };
      } else {
        merged[name].reasons.push(effect);
      }
    }
  });

  const likedList = Object.values(merged);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>찜한 영양성분 목록</Text>
      </View>

      {likedList.length === 0 ? (
        <Text style={styles.emptyText}>찜한 영양소가 없습니다.</Text>
      ) : (
        likedList.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={
                  item.type === "추천"
                    ? require("../../assets/icons/thumbsup.png")
                    : require("../../assets/icons/thumbsdown.png")
                }
                style={styles.icon}
              />
              <Text style={styles.nutrientTitle}>{item.name}</Text>
            </View>
            <Text style={styles.reasonLabel}>추천 이유</Text>
            {item.reasons.map((reason, i) => (
              <Text key={i} style={styles.reasonText}>
                • {reason}
              </Text>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
});

export default LikedNutrientsScreen;
