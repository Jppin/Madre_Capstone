// screens/NutritionScreen/NutritionScreen.js
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
import { useNavigation } from "@react-navigation/native"; 




const { width } = Dimensions.get("window");



const NutrientRecommendationScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nickname, setNickname] = useState("사용자");
  const [selectedButton, setSelectedButton] = useState("recommend");
  const [nutrients, setNutrients] = useState([]);
  const [likedNutrients, setLikedNutrients] = useState({});
  const [recommendNutrients, setRecommendNutrients] = useState([]);
  const [warningNutrients, setWarningNutrients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); 



  
  const toggleLike = async (nutrient) => {
    try {
      const token = await AsyncStorage.getItem("token");
  
      if (likedNutrients[nutrient]) {
        // ✅ 이미 찜한 상태라면 → 백엔드에서 삭제 요청
        await fetch("http://10.0.2.2:5001/api/unlike-nutrient", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nutrientName: nutrient }),
        });
  
        setLikedNutrients((prev) => ({
          ...prev,
          [nutrient]: false,
        }));
      } else {
        // ✅ 찜한 상태가 아니라면 → 백엔드에 저장 요청
        await fetch("http://10.0.2.2:5001/api/like-nutrient", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nutrientName: nutrient }),
        });
  
        setLikedNutrients((prev) => ({
          ...prev,
          [nutrient]: true,
        }));
      }
    } catch (error) {
      console.error("찜한 영양 성분 업데이트 오류:", error);
    }
  };
  








  const fetchRecommendations = async () => {
    try {
      setLoading(true);  // 🔥 로딩 시작
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://10.0.2.2:5001/nutrient-recommendations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const json = await response.json();
      
      if (json.recommendList && json.warningList) {
        setRecommendNutrients(json.recommendList);
        setWarningNutrients(json.warningList);
      }
    } catch (error) {
      console.error("❌ 추천 영양성분 가져오기 오류:", error);
    }
    finally {
      setLoading(false);  // 🔥 로딩 종료
    }
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

          // ✅ 사용자 정보 불러온 후 영양 성분 추천 API 호출
        fetchRecommendations();
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
    setNutrients(recommendNutrients);
  } else if (selectedButton === "warning") {
    setNutrients(warningNutrients);
  } else {
    setNutrients([]); // 버튼이 선택 해제되었을 경우 초기화
  }
}, [selectedButton, recommendNutrients, warningNutrients]);






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
              source={require("../../assets/icons/search1.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      </View>




      <ScrollView>
        {/* NutriBox 추천 배너 */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/icons/nutribox.png")}
            style={styles.bannerImage}
          />
          <Text style={styles.bannerText}>
            {nickname}님을 위한 맞춤형{"\n"}영양성분 추천 확인하세요!
          </Text>
        </View>



      
      {/* ✅ 새로고침 버튼 추가 */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchRecommendations}>
          <Text style={styles.refreshButtonText}>
            추천 정보 다시 불러오기 {loading ? " (로딩 중...)" : ""}
          </Text>
        </TouchableOpacity>
      
    

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
        <TouchableOpacity style={styles.listItem} onPress={()=> navigation.navigate("jjim")}>
          <Text style={styles.listItemText}>❤️ 내가 찜한 영양성분</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.listItem, styles.listItemWithBorder]}>
          <Text style={styles.listItemText}>⏳ 과거 영양성분 추천 기록</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
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
///////////////////////////////////////
  refreshButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
////////////////////////////////////////////  
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
    backgroundColor: "#BBDA6C",
    borderColor: "#BBDA6C",
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

