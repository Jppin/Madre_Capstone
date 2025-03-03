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
import Icon from "react-native-vector-icons/Ionicons";



const { width } = Dimensions.get("window");



const NutrientRecommendationScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nickname, setNickname] = useState("사용자");
  const [selectedButton, setSelectedButton] = useState("recommend");
  const [nutrients, setNutrients] = useState([]);
  const [likedNutrients, setLikedNutrients] = useState({});
  
  
  const recommendList = [
    { name: "비타민 D", effect: "💪 뼈 건강 - 칼슘 흡수 촉진 및 골다공증 예방" },
    { name: "오메가3", effect: "🧠 두뇌 건강 - 인지 기능 향상 및 기억력 보호" },
    { name: "프로바이오틱스", effect: "🦠 장 건강 - 유익균 증식 및 소화 기능 개선" },
  ];
  
  const warningList = [
    { name: "고용량 철분", effect: "⚠️ 위장 장애 - 위 불편감 및 변비 유발 가능" },
    { name: "카페인", effect: "⚠️ 수면 장애 - 과다 섭취 시 불면증 및 불안 유발" },
    { name: "고용량 비타민 A", effect: "⚠️ 간 독성 - 장기간 섭취 시 간 손상 위험" },
  ];


  
  const toggleLike = (nutrient) => {
    setLikedNutrients((prev) => ({
      ...prev,
      [nutrient]: !prev[nutrient],
    }));
  };


  const handleButtonPress = (type) => {
    setSelectedButton(type);
  };






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


  // ✅ selectedButton 변경될 때마다 즉시 업데이트
useEffect(() => {
  if (selectedButton === "recommend") {
    setNutrients(recommendList);
  } else if (selectedButton === "warning") {
    setNutrients(warningList);
  } else {
    setNutrients([]); // 버튼이 선택 해제되었을 경우 초기화
  }
}, [selectedButton]);






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
        <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationText}>
        {nickname}님의 대표적인{"\n"}추천/비추천 영양성분이에요
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.buttonBase,
              selectedButton === "recommend" ? styles.recommendButtonActive : null,
            ]}
            onPress={() => setSelectedButton(selectedButton === "recommend" ? null : "recommend")}
          >
            <Text
              style={[
                styles.buttonTextBase,
                selectedButton === "recommend" ? styles.recommendButtonTextActive : null,]}
                onPress={() => handleButtonPress("recommend")}
            >👍 추천해요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonBase,
              selectedButton === "warning" ? styles.warningButtonActive : null,]}

             onPress={() => handleButtonPress("warning")}
          >
            <Text style={[
                styles.buttonTextBase,
                selectedButton === "warning" ? styles.warningButtonTextActive : null,
              ]}
            >👎 주의해요</Text>
          </TouchableOpacity>
        </View>






        {/* 영양 성분 리스트 */}
        <View>
          {nutrients.map((item, index) => (
            <View key={index} style={styles.nutrientCard}>
              <Text style={styles.nutrientTitle}>{item.name}</Text>
              <Text style={styles.nutrientInfo}>{item.effect}</Text>

              {/* 하트 아이콘 추가 */}
              <TouchableOpacity
                onPress={() => toggleLike(item.name)}
                style={styles.heartButton}
              >
                <Icon
                  name={likedNutrients[item.name] ? "heart" : "heart-outline"}
                  size={24}
                  color="red"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>








        {/* 내가 찜한 영양 성분 & 최근 확인한 영양 성분 */}
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>❤️ 내가 찜한 영양성분</Text>
          <Image source={require("../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.listItem, styles.listItemWithBorder]}>
          <Text style={styles.listItemText}>⏳ 최근 확인한 영양성분</Text>
          <Image source={require("../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>
      </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  arrowIcon: {
    width: 20, // 아이콘 크기
    height: 20,
    marginLeft: "auto", // 오른쪽 정렬 (필요 시)
    tintColor: "#333", // 아이콘 색상 변경 (필요 시)
  },
  
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingTop: 20,
    paddingBottom: 10,
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
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  bannerImage: {
    width: 60,
    height: 55,
    marginRight: 10,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F15A24",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap:10,
    
   
  },
  buttonBase: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 40,
    width: 165,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  buttonTextBase: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  recommendationContainer: {
    backgroundColor: "#fee2d5",  // 배경색 추가
    borderRadius: 20,           // 둥근 모서리
    padding: 20,                // 내부 패딩
    marginHorizontal: 10,
    paddingBottom: 30,          // 버튼과 내용 간 여백 추가
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10, // 버튼과 간격 추가
  },

  recommendButtonActive: {
    backgroundColor: "#238B45",
    borderColor: "#41AB5D",
  },
  recommendButtonTextActive: {
    color: "#FFF",
  },
  warningButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#fb6a4a",
  },
  warningButtonTextActive: {
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
    marginBottom:7,
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
    padding: 5, // 터치 영역 확대
  },
  heartImage: {
    width: 24,
    height: 24,
  },
  listItem: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 15,
  borderColor: "#E0E0E0",
  marginHorizontal: 20,
  marginTop:10,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listItemWithBorder: {
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    paddingTop:20,
    marginTop:10,
    marginBottom: 15,
  },
});

export default NutrientRecommendationScreen;

