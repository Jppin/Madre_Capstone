// screens/NutritionScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const NutrientRecommendationScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nickname, setNickname] = useState("사용자"); // 기본값 설정

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch("http://10.0.2.2:5001/user-full-data", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        if (json.status === "ok" && json.data.nickname) {
          setNickname(json.data.nickname);
        }
      } catch (error) {
        console.error("사용자 데이터 불러오기 오류:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>내 추천 영양성분</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="어떤 영양성분을 찾으세요?"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/search1.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {/* NutriBox 추천 배너 */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../assets/icons/nutribox.png")}
            style={styles.bannerImage}
          />
          <Text style={styles.bannerText}>
            {nickname}님을 위한 맞춤형{"\n"}영양성분 추천 확인하세요!
          </Text>
        </View>

        {/* 추천 및 주의사항 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.recommendButton}>
            <Text style={styles.recommendButtonText}>추천해요</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.warningButton}>
            <Text style={styles.warningButtonText}>주의해요</Text>
          </TouchableOpacity>
        </View>

        {/* 영양 성분 리스트 */}
        <View style={styles.nutrientCard}>
          <Text style={styles.nutrientTitle}>오메가3 (EPA + DHA)</Text>
          <Text style={styles.nutrientInfo}>🧠 지병: 우울증 - 신호 전달 원활, 개선 도움</Text>
          <Text style={styles.nutrientInfo}>💖 지병: 폐질환 - 폐 질환 위험 감소</Text>
          <Text style={styles.nutrientInfo}>🌙 건강 고민: 스트레스 및 수면 - 뇌세포 보호</Text>
          <TouchableOpacity style={styles.heartIcon}>
            <Image
              source={require("../assets/icons/heart.png")}
              style={styles.heartImage}
            />
          </TouchableOpacity>
        </View>

        {/* 내가 찜한 영양 성분 & 최근 확인한 영양 성분 */}
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>❤️ 내가 찜한 영양성분</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>⏳ 최근 확인한 영양성분</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "gray",
  },
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    marginHorizontal: 8,
    borderRadius: 30,
    borderWidth:1,
    borderColor: "transparent",
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  bannerImage: {
    width: 60,
    height: 50,
    marginRight: 10,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F15A24",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  recommendButton: {
    backgroundColor: "#A6E3A1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  recommendButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  warningButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  warningButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  nutrientCard: {
    backgroundColor: "#FFF",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  heartIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  heartImage: {
    width: 24,
    height: 24,
  },
  listItem: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NutrientRecommendationScreen;
