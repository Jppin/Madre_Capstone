// screens/NutritionScreen/jjim.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import createAPI from "../../api";


const { width } = Dimensions.get("window");

const JjimScreen = ({ navigation }) => {
    const [likedNutrients, setLikedNutrients] = useState([]);
  
    const fetchLikedNutrients = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const api = await createAPI();

        console.log("✅ 저장된 토큰:", token);
        if (!token) {
          console.error("토큰이 없습니다.");
          return;
        }
    
        const res = await api.get("/api/liked-nutrients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📡 찜한 영양성분 응답:", res.data);
        setLikedNutrients(res.data.likedNutrients || []);
        
      } catch (error) {
        console.error("❌ 찜 API 호출 오류:", error.message);
        if (error.response) {
          console.error("❌ 서버 응답:", error.response.data);
        } else if (error.request) {
          console.error("❌ 요청은 보냈지만 응답 없음:", error.request);
        } else {
          console.error("❌ 설정 에러:", error.message);
        }
      }
    };
  
    // ✅ 화면이 포커스될 때마다 최신 데이터 가져오기
    useFocusEffect(
      React.useCallback(() => {
        fetchLikedNutrients();
      }, [])
    );
  
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내가 찜한 영양성분</Text>
        </View>
  
        <ScrollView>
          {likedNutrients.length > 0 ? (
            likedNutrients.map((nutrient, index) => (
              <View key={index} style={styles.nutrientCard}>
                <Text style={styles.nutrientTitle}>{nutrient}</Text>
                <TouchableOpacity onPress={() => toggleLike(nutrient)} style={styles.heartButton}>
                  <Icon name="heart" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>찜한 영양성분이 없습니다.</Text>
          )}
        </ScrollView>
      </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  nutrientCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 7,
    marginHorizontal: 10,
  },
  nutrientTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F15A24",
  },
  nutrientInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#777",
  },
});

export default JjimScreen;
