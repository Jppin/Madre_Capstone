import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';
import PagerView from 'react-native-pager-view';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import createAPI from '../../api';
import { parseMealSections, parseThemeSection } from '../../../backend/services/nutrientUtils';


const { width } = Dimensions.get('window');

const CombinedScreen = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { userData, loading } = useContext(AuthContext);

  // 공통 및 NutritionScreen 관련 state
  const [nickname, setNickname] = useState('사용자');
  const [selectedButton, setSelectedButton] = useState('recommend');
  const [nutrients, setNutrients] = useState([]);
  const [likedNutrients, setLikedNutrients] = useState({});
  const [recommendNutrients, setRecommendNutrients] = useState([]);
  const [warningNutrients, setWarningNutrients] = useState([]);

  // HomeScreen 관련 state
  const images = [
    require('../../assets/image1.jpg'),
    require('../../assets/image2.jpg'),
    require('../../assets/image3.jpg'),
  ];
  const pagerRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [userConcerns, setUserConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [nutrientList, setNutrientList] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [todayText, setTodayText] = useState("");



  useEffect(() => {
    if (!loading && userData && userData.concerns?.length > 0 && isFocused) {
      setNickname(userData.nickname || "사용자");
      setUserConcerns(userData.concerns);
      setSelectedConcern(userData.concerns[0]);
      fetchData(userData); // 🔹 확실하게 넘김
    }
  }, [userData, loading, isFocused]);

  const fetchData = async (user) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();

      // 찜 목록
      const likesRes = await api.get("/nutrient/likes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(likesRes.data.likedNutrients)) {
        const parsed = {};
        likesRes.data.likedNutrients.forEach((name) => {
          parsed[name] = true;
        });
        setLikedNutrients(parsed);
      }

      // 관심사 기반 추천
      const recRes = await api.get("/nutrient/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
        params: { concerns: user.concerns }, // 🔥 여기에 명시적으로 포함
      });

      const recommendList = recRes.data?.data ?? [];
      setNutrientList(recommendList);

      // 개인화 추천/주의 리스트
      const personalRes = await api.get("/nutrient/personal", {
        headers: { Authorization: `Bearer ${token}` },
        params: { concerns: user.concerns }, // 🔥 마찬가지로 명시
      });
      if (
        Array.isArray(personalRes.data.recommendList) &&
        Array.isArray(personalRes.data.warningList)
      ) {
        setRecommendNutrients(mergeRecommendationsByName(personalRes.data.recommendList));
        setWarningNutrients(mergeRecommendationsByName(personalRes.data.warningList));

      }
    } catch (err) {
      console.error("전체 데이터 불러오기 오류:", err.response?.data || err.message || err);
    }
  };

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    setTodayText(`${month}.${day} 오늘`);
  }, []);




  const toggleLike = async (nutrientName) => {
    console.log("[toggleLike] 하트 눌림:", nutrientName);
    try {
      const token = await AsyncStorage.getItem('token');
      const api = await createAPI();
      const isLiked = likedNutrients[nutrientName];

      const endpoint = isLiked
        ? '/nutrient/unlike'
        : '/nutrient/like';

      await api.post(endpoint, { nutrientName }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 상태 업데이트
      setLikedNutrients((prev) => ({
        ...prev,
        [nutrientName]: !prev[nutrientName],
      }));
    } catch (error) {
      console.error('찜 토글 오류:', error);
    }
  };


  const handleRecentDietPress = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();

      const res = await api.get("/mealplan/latest", {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigation.navigate("Diet", { mealPlan: res.data });
    } catch (err) {
      console.error("🔥 최근 식단 불러오기 실패:", err.response?.data || err.message);
    }
  };


  // 📍 추천리스트 가공 함수
  const mergeRecommendationsByName = (list) => {
    const merged = {};

    list.forEach((item) => {
      const name = item.name;
      if (!merged[name]) {
        merged[name] = {
          name,
          reasons: [item.effect], // 초기 이유
        };
      } else {
        merged[name].reasons.push(item.effect); // 추가 이유
      }
    });

    return Object.values(merged); // 객체 -> 배열로 변환
  };


  /** 추천/주의 버튼에 따른 데이터 갱신 */
  useEffect(() => {
    if (selectedButton === "recommend") {
      setNutrients(recommendNutrients);
    } else if (selectedButton === "warning") {
      setNutrients(warningNutrients);
    } else {
      setNutrients([]);
    }
  }, [selectedButton, recommendNutrients, warningNutrients]);


  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (pageIndex + 1) % images.length;
      setPageIndex(nextIndex);
      pagerRef.current?.setPage(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [pageIndex, images.length]);


  const toggleConcern = (concern) => {
    setSelectedConcern(concern);
  };


  const navigateToDetail = (nutrient) => {
    navigation.navigate('NutrientDetail', { nutrient });
  };


  const handleNutrientClick = (nutrient) => {
    setSelectedNutrient((prev) => (prev === nutrient.name ? null : nutrient.name));
    setSelectedReason(
      nutrient.recommendations?.filter(rec => rec.category === "건강관심사" && userConcerns.includes(rec.keyword))
        .map(rec => rec.reason)
        .join("\n") || "추천 이유를 찾을 수 없습니다."
    );
  };


  const filteredNutrients = nutrientList.filter((nutrient) =>
    selectedConcern
      ? nutrient.recommendations?.some(
        (rec) => rec.category === "건강관심사" && rec.keyword === selectedConcern
      )
      : true
  );




  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>
      <View>

        {/* Home 헤더 */}
        <View style={homeStyles.headerContainer}>

          {/* 앱 로고 이미지 */}
          <Image source={require('../../assets/icons/logotext.png')} style={homeStyles.logoIcon} />

          {/* 헤더 오른쪽 버튼 영역 */}
          <TouchableOpacity
            style={homeStyles.heartButton1}
            onPress={() => navigation.navigate("LikedNutrientsScreen")}
          >
            <Icon name="heart" size={28} color="#fff" />
            <Text style={homeStyles.headerIconLabel}>찜</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[homeStyles.profileButton, homeStyles.headerButtonWrapper]}
            onPress={() => navigation.navigate("MyPageScreen")}
          >
            <Icon name="person-circle" size={28} color="#fff" />
            <Text style={homeStyles.headerIconLabel}>MyPage</Text>
          </TouchableOpacity>
        </View>

        {/* 홈 배너 */}
        <View style={homeStyles.carouselContainer}>
          <PagerView ref={pagerRef} style={homeStyles.pagerView} initialPage={0}>
            {images.map((image, idx) => (
              <View key={idx}>
                <Image source={image} style={homeStyles.image} />
              </View>
            ))}
          </PagerView>
          <View style={homeStyles.pagination}>
            {images.map((_, idx) => (
              <View key={idx} style={[homeStyles.dot, idx === pageIndex && homeStyles.activeDot]} />
            ))}
          </View>
        </View>

        {/* 건강 관심사 추천 */}
        <View style={homeStyles.recommendationSection}>
          <Text style={homeStyles.sectionTitle} numberOfLines={2} adjustsFontSizeToFit>
            {nickname}님의 건강고민별 맞춤 영양성분
          </Text>

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row' }}
              style={homeStyles.tagScroll}
            //key={selectedConcern}
            >
              {userConcerns.map((concern, index) => (
                <TouchableOpacity
                  key={index}
                  style={[homeStyles.tag, selectedConcern === concern && homeStyles.selectedTag]}
                  onPress={() => toggleConcern(concern)}
                >
                  <Text style={[homeStyles.tagText, selectedConcern === concern && homeStyles.selectedTagText]}>
                    {concern}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>


          {/* 영양성분 버튼 영역 */}
          {filteredNutrients.length > 0 ? (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row' }}
                style={homeStyles.nutrientsScroll}
              >
                {filteredNutrients.map((nutrient, index) => (
                  <View key={index} style={homeStyles.nutrientWrapper}>

                    {/* 각 영양성분 버튼 */}
                    <TouchableOpacity
                      style={[homeStyles.nutrientBox, selectedNutrient === nutrient.name && homeStyles.selectedNutrient]}
                      onPress={() => handleNutrientClick(nutrient)}
                    >
                      <Image source={require('../../assets/icons/nutrientEx1.png')} style={homeStyles.nutrientIcon} />
                      <Text style={homeStyles.nutrientText} numberOfLines={1} ellipsizeMode="tail">
                        {nutrient.name}
                      </Text>
                      <TouchableOpacity onPress={() => toggleLike(nutrient.name)} style={homeStyles.heartButton}>
                        <Icon
                          name={likedNutrients[nutrient.name] ? 'heart' : 'heart-outline'}
                          size={18}
                          color="red"
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigateToDetail(nutrient.name)} style={homeStyles.detailButton}>
                      <Text style={homeStyles.detailButtonText}>상세보기</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={homeStyles.noNutrientsBox}>
              <Text style={homeStyles.noNutrientsText}>해당하는 영양성분이 없습니다.</Text>
            </View>
          )}

          {/* 추천 이유 창은 해당하는 영양성분이 있을 때만 표시 */}
          {selectedNutrient && filteredNutrients.length > 0 && (
            <View style={homeStyles.recommendationBox}>
              <Text style={homeStyles.recommendationTitle}>추천 이유</Text>
              <Text style={homeStyles.recommendationText}>{selectedReason}</Text>
            </View>
          )}

        </View>

        {/* 식단 추천 */}
        <View style={foodContainerStyles.mealPlanContainer}>

          {/* 왼쪽: 타이틀 + 이미지 */}
          <View style={foodContainerStyles.leftSection}>
            <Text style={foodContainerStyles.mealTitle}>{nickname}님 맞춤식단</Text>
            <TouchableOpacity onPress={handleRecentDietPress}>
              <View style={foodContainerStyles.imageCircle}>
                <Image
                  source={require('../../assets/icons/foodcalandar.png')}
                  style={foodContainerStyles.foodImage}
                />
                <Text style={foodContainerStyles.dateText}>{todayText}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* 오른쪽: 정보 + 버튼 */}
          <View style={foodContainerStyles.rightSection}>
            <Text style={foodContainerStyles.kcalText}>
              섭취 칼로리{'\t\t\t'}
              <Text style={{ fontWeight: 'bold' }}>? kcal</Text>
            </Text>


            <View style={foodContainerStyles.divider} />

            <View style={foodContainerStyles.warningRow}>
              <Image source={require('../../assets/icons/warning.png')} style={foodContainerStyles.iconSmall} />
              <Text style={foodContainerStyles.warningText}>알레르기 / 입덧이 있어 주의할{'\n'}음식을 입력해주세요.</Text>
            </View>

            <View style={foodContainerStyles.divider} />

            <View style={foodContainerStyles.buttonWrapper}>

              <TouchableOpacity
                style={foodContainerStyles.customButton}
                onPress={() => navigation.navigate('Allergy')}
              >
                <Text style={foodContainerStyles.customButtonText}>
                  새로운 식단 생성하기
                </Text>
                <Image
                  source={require('../../assets/icons/bowl.png')}
                  style={foodContainerStyles.bowlIcon}
                />
              </TouchableOpacity>
            </View>


          </View>

        </View>

        {/* 추천/비추천 버튼 */}
        <View style={nutritionStyles.recommendationContainer}>

          <View style={nutritionStyles.rowWithIcon}>

            <View style={{ flex: 1 }}>
              <Text style={nutritionStyles.recommendationText2}>맞춤식단 생성에 반영되는</Text>
              <Text style={nutritionStyles.recommendationText}>{nickname}님의 필요/주의 성분 List</Text>
            </View>

            <Image
              source={require('../../assets/icons/balancescale.png')}
              style={nutritionStyles.iconImage}
            />

          </View>

          <View style={nutritionStyles.buttonRow}>

            <TouchableOpacity
              style={[
                nutritionStyles.buttonBase,
                selectedButton === 'recommend' && nutritionStyles.recommendButtonActive,
              ]}
              onPress={() => setSelectedButton('recommend')}
            >
              <Text
                style={[
                  nutritionStyles.buttonTextBase,
                  selectedButton === 'recommend' && nutritionStyles.recommendButtonTextActive,
                ]}
              >
                👍 필요해요
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                nutritionStyles.buttonBase,
                selectedButton === 'warning' && nutritionStyles.warningButtonActive,]}
              onPress={() => setSelectedButton('warning')}
            >
              <Text
                style={[
                  nutritionStyles.buttonTextBase,
                  selectedButton === 'warning' && nutritionStyles.warningButtonTextActive,
                ]}
              >
                👎 주의해요
              </Text>
            </TouchableOpacity>
            
          </View>

          {/* 추천 영양성분 리스트 */}
          {nutrients.map((item, idx) => (

            <View key={idx} style={nutritionStyles.nutrientCard}>
              <Text style={nutritionStyles.nutrientTitle}>{item.name}</Text>
              <Text style={nutritionStyles.nutrientInfo}>
                {(item.reasons || []).map((reason, idx) => `• ${reason}`).join('\n\n')}
              </Text>
              {/* 두번이상 호출된거 한칸띄고 설명넣음ㅁ */}
              <TouchableOpacity
                onPress={() => toggleLike(item.name)}
                style={nutritionStyles.heartButton}
              >
                <Icon name={likedNutrients[item.name] ? 'heart' : 'heart-outline'} size={24} color="red" />
              </TouchableOpacity>
            </View>

          ))}

          <View style={{ height: 40 }} />

        </View>

      </View>
    </ScrollView>
  );
};









// 스타일 분리: nutritionStyles와 homeStyles로 관리
const homeStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },


  // Header
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 80,
    justifyContent: 'center', // 가로 중앙 정렬
    alignItems: 'flex-end', // 요소들을 아래쪽 정렬
    position: 'relative', // 내부 요소의 절대 위치 설정 가능
  },

  logoIcon: {
    width: 190,
    height: 40,
    position: 'absolute',
    bottom: 20, // 텍스트와 같은 높이로 맞춤
    left: '37%', // 텍스트 기준 중앙으로 이동
    transform: [{ translateX: -130 }], // 텍스트 기준 왼쪽으로 90px 이동
  },

  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  // Carousel
  carouselContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  pagerView: {
    width: width * 0.9,
    height: 180,
  },
  image: {
    width: width * 0.9,
    height: 180,
    borderRadius: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FBAF8B',
  },

  // Recommendations
  recommendationSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  recommendationBox: {
    padding: 15,
    backgroundColor: '#A4E0E580',
    borderRadius: 10,
    marginVertical: 10,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: "#117389",
  },
  recommendationText: {
    fontSize: 12,
    color: 'black',
  },

  detailButton: {
    position: 'absolute',
    bottom: 5,
    right: 15,
  },
  detailButtonText: {
    fontSize: 10,
    color: 'gray',
  },

  // Tags
  tagScroll: {
    marginVertical: 10,
  },
  tag: {
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#91969A',
  },
  tagText: {
    fontSize: 12,
    color: '#91969A',
  },
  selectedTag: {
    backgroundColor: '#FBAF8B',
    borderColor: "#FBAF8B",
  },
  selectedTagText: {
    color: '#fff',
  },

  // No Nutrients Message
  noNutrientsBox: {
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  noNutrientsText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },

  // Nutrients
  nutrientWrapper: {
    alignItems: 'center',
  },
  nutrientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  nutrientsScroll: {
    marginVertical: 10,
  },
  nutrientBox: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
    position: 'relative',
    marginRight: 10,
  },
  nutrientIcon: {
    width: 40,
    height: 40,
    marginBottom: 7,
  },
  nutrientText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center',
  },
  heartButton1: {
    position: 'absolute',
    top: 30,
    right: 70, // 하트보다 왼쪽 (하트는 right: 20)
    zIndex: 10,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  selectedNutrient: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
  },

  profileButton: {
    position: 'absolute',
    top: 30,
    right: 15,
    zIndex: 10,
  },

  headerIconLabel: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  headerButtonWrapper: {
    alignItems: 'center', // 아이콘 + 텍스트 수직 정렬 중앙
  },
});











const foodContainerStyles = StyleSheet.create({
  mealPlanContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    marginHorizontal: 10,
    color: '#000000',
  },
  leftSection: {
    flex: 4,
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 80,
    borderWidth: 15,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',

  },
  foodImage: {
    width: 45,
    height: 45,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  rightSection: {
    flex: 6,
    paddingLeft: 24,
    justifyContent: 'flex-start',
  },
  kcalText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSmall: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  warningText: {
    fontSize: 10,
    color: '#444',
  },


  buttonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },

  customButton: {
    backgroundColor: '#FFAFA3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bowlIcon: {
    width: 100,
    height: 100,
    position: 'absolute',
    right:-15,     // 버튼 내부 오른쪽 끝에서부터
  },

  customButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    paddingRight: 50, // 아이콘 영역 확보용 여백
  },


});














const nutritionStyles = StyleSheet.create({
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
  searchContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',       // 아이콘과 텍스트 수직 정렬
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 36,                 // ✅ 조금만 키워야 안정됨
  },
  searchBar: {
    flex: 1,
    fontSize: 12,               // ✅ 글씨 크기 조절
    textAlignVertical: 'center',
    paddingVertical: 0,         // ✅ 기본 패딩 제거
    //includeFontPadding: false,  // ✅ 폰트 패딩 제거 (안드로이드 전용)
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
    gap: 10,
  },
  buttonBase: {
    backgroundColor: "#FFF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 40,
    width: 150,
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
    backgroundColor: "#f3feff",  // 배경색 추가
    borderRadius: 20,           // 둥근 모서리
    padding: 20,                // 내부 패딩
    marginHorizontal: 10,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,       // 버튼과 내용 간 여백 추가
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10, // 버튼과 간격 추가
  },
  recommendationText2: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5, // 버튼과 간격 추가
    color: "#FBAF8B",
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
    marginBottom: 7,
  },
  nutrientTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#bbda6c",
  },
  nutrientTitle2: {
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
    marginTop: 10,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listItemWithBorder: {
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    paddingTop: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  rowWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  iconImage: {
    width: 60,
    height: 60,
    marginLeft: 5,
  },


});

export default CombinedScreen;
