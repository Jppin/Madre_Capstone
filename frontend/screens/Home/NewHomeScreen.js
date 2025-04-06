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

const { width } = Dimensions.get('window');

const CombinedScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { userData } = useContext(AuthContext);

  // 공통 및 NutritionScreen 관련 state
  const [nickname, setNickname] = useState('사용자');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedButton, setSelectedButton] = useState('recommend');
  const [nutrients, setNutrients] = useState([]);
  const [likedNutrients, setLikedNutrients] = useState({});
  const [recommendNutrients, setRecommendNutrients] = useState([]);
  const [warningNutrients, setWarningNutrients] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const toggleLike = async (nutrientName) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const isLiked = likedNutrients[nutrientName];
  
      if (isLiked) {
        // 삭제 요청
        await fetch("http://10.0.2.2:5001/api/unlike-nutrient", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nutrientName }),
        });
      } else {
        // 저장 요청
        await fetch("http://10.0.2.2:5001/api/like-nutrient", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nutrientName }),
        });
      }
  
      // 상태 업데이트
      setLikedNutrients((prev) => ({
        ...prev,
        [nutrientName]: !prev[nutrientName],
      }));
    } catch (error) {
      console.error("찜 토글 오류:", error);
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
  
  





  const fetchRecommendations = async () => {
    try {
      if (!userData?._id) return; // ✅ 사용자 정보 없으면 실행 안 함!
      setLoading(true);
  
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.0.2.2:5001/nutrient-recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const json = await response.json();
  
      if (json.recommendList && json.warningList) {

      const mergedRecommend = mergeRecommendationsByName(json.recommendList);
      const mergedWarning = mergeRecommendationsByName(json.warningList);

        setRecommendNutrients(mergedRecommend);
        setWarningNutrients(mergedWarning);
      }
    } catch (error) {
      console.error('추천 영양성분 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
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

  /** HomeScreen 관련 로직 */
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (pageIndex + 1) % images.length;
      setPageIndex(nextIndex);
      pagerRef.current?.setPage(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [pageIndex, images.length]);

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        if (!userConcerns.length) return;

        const response = await fetch(`http://10.0.2.2:5001/nutrients/recommendations?concerns=${JSON.stringify(userConcerns)}`);
        const json = await response.json();

        if (json.status === "ok") {
          setNutrientList(json.data);
        }
      } catch (error) {
        console.error("Error fetching nutrients:", error);
      }
    };

    fetchNutrients();
  }, [userConcerns, isFocused]);

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




  useEffect(() => {
  const fetchLikedNutrients = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://10.0.2.2:5001/api/liked-nutrients", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      const parsed = {};
      json.likedNutrients.forEach((name) => {
        parsed[name] = true;
      });

      setLikedNutrients(parsed);
    } catch (error) {
      console.error("찜 목록 불러오기 오류:", error);
    }
  };

  if (userData && isFocused) {
    fetchLikedNutrients();
  }
}, [userData, isFocused]); 
  



  useEffect(() => {
    if (userData) {
      setNickname(userData.nickname || "사용자");
      setUserConcerns(userData.concerns || []);
      if (userData.concerns?.length > 0) {
        setSelectedConcern(userData.concerns[0]);
      }
    }
  }, [userData]);
  



  useEffect(() => {
    if (isFocused) {
      fetchRecommendations();
    }
  }, [isFocused]);
  















  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}showsVerticalScrollIndicator={false}>

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
            {nickname}님의 관심사 맞춤 영양성분 추천
          </Text>

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






          {/* 영양성분 버튼 영역 */}
          {filteredNutrients.length > 0 ? (
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

      {/* 추천 정보 다시 불러오기 버튼
      <TouchableOpacity style={nutritionStyles.refreshButton} onPress={fetchRecommendations}>
        <Text style={nutritionStyles.refreshButtonText}>추천 정보 다시 불러오기 {loading ? '(로딩 중...)' : ''}</Text>
      </TouchableOpacity>
      */}



      {/* 추천/비추천 버튼 */}
      <View style={nutritionStyles.recommendationContainer}>
        
        <Text style={nutritionStyles.recommendationText}>{nickname}님의 추천/비추천 영양성분입니다</Text>
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
              👍 추천해요
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              nutritionStyles.buttonBase,
              selectedButton === 'warning' && nutritionStyles.warningButtonActive,
            ]}
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
            <Text style={nutritionStyles.nutrientInfo}>{(item.reasons || []).join('\n\n')}</Text> 
            {/* 두번이상 호출된거 한칸띄고 설명넣음ㅁ */}
            <TouchableOpacity
              onPress={() => toggleLike(item.name)}
              style={nutritionStyles.heartButton}
            >
              <Icon name={likedNutrients[item.name] ? 'heart' : 'heart-outline'} size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      
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
        marginVertical: 20,
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
        marginVertical: 10,
        marginHorizontal: 10,
      },
      sectionTitle: {
        fontSize: 18,
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#91969A',
      },
      tagText: {
        fontSize: 14,
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

export default CombinedScreen;
