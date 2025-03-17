//HomeScreen.js

import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const images = [
    require('../../assets/image1.jpg'),
    require('../../assets/image2.jpg'),
    require('../../assets/image3.jpg')
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const pagerRef = useRef(null);
  const navigation = useNavigation();
  const { getData } = useContext(AuthContext);
  const [nickname, setNickname] = useState("");
  const [userConcerns, setUserConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [selectedReason, setSelectedReason] = useState({});
  const [likedNutrients, setLikedNutrients] = useState({});
  const [nutrientList, setNutrientList] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (pageIndex + 1) % images.length;
      setPageIndex(nextIndex);
      pagerRef.current?.setPage(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [pageIndex, images.length]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch("http://10.0.2.2:5001/user-full-data", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const json = await response.json();
        if (json.status === "ok") {
          setNickname(json.data.nickname || "사용자");
          setUserConcerns(json.data.concerns || []);
          if (json.data.concerns && json.data.concerns.length > 0) {
            setSelectedConcern(json.data.concerns[0]);
          }
        } else {
          console.error("사용자 데이터를 불러오는 중 오류:", json.message);
        }
  
        const storedLikes = await AsyncStorage.getItem("liked_nutrients");
        setLikedNutrients(storedLikes ? JSON.parse(storedLikes) : {});
      } catch (error) {
        console.error("데이터 불러오기 오류:", error);
      }
    };
  
    fetchUserData();
  }, [isFocused]);
  
  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        if (userConcerns.length === 0) return;
  
        const response = await fetch(`http://10.0.2.2:5001/nutrients/recommendations?concerns=${JSON.stringify(userConcerns)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        const json = await response.json();
        if (json.status === "ok") {
          setNutrientList(json.data);
        } else {
          console.error("Failed to fetch nutrients:", json.message);
        }
      } catch (error) {
        console.error("Error fetching nutrients:", error);
      }
    };
  
    if (isFocused) {
      fetchNutrients();
    }
  }, [userConcerns, isFocused]);
  
  useEffect(() => {
    if (userConcerns.length > 0) {
      setSelectedConcern(userConcerns[0]);
    }
  }, [userConcerns]);
  
  useEffect(() => {
    if (!selectedConcern || nutrientList.length === 0) {
      setSelectedReason("추천 이유를 찾을 수 없습니다.");
      setSelectedNutrient(null);
      return;
    }
  
    const matchedNutrient = nutrientList.find(nutrient => 
      nutrient.recommendations.some(rec => rec.keyword.trim().toLowerCase() === selectedConcern.trim().toLowerCase())
    );
  
    if (!matchedNutrient) {
      setSelectedReason("추천 이유를 찾을 수 없습니다.");
      setSelectedNutrient(null);
      return;
    }
  
    const matchedReason = matchedNutrient.recommendations.find(rec => rec.keyword === selectedConcern)?.reason;
    setSelectedReason(matchedReason || "추천 이유를 가져오는 중...");
    setSelectedNutrient(matchedNutrient.name);
  }, [selectedConcern, nutrientList]);
  
  const toggleLike = async (nutrient) => {
    setLikedNutrients(prev => {
      const updatedLikes = { ...prev, [nutrient]: !prev[nutrient] };
      AsyncStorage.setItem("liked_nutrients", JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };
  
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
  
  const filteredNutrients = Array.isArray(nutrientList) ? nutrientList.filter(nutrient => 
    !selectedConcern || nutrient.recommendations?.some(rec => rec.category === "건강관심사" && rec.keyword === selectedConcern)
  ) : [];
  

  return (
    <>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/icons/logo3.png')}
          style={styles.logoIcon}
        />
        <Text style={styles.logoText}>NutriBox</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.carouselContainer}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
          >
            {images.map((image, index) => (
              <View key={index}>
                <Image source={image} style={styles.image} />
              </View>
            ))}
          </PagerView>

          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View key={index} style={[styles.dot, pageIndex === index && styles.activeDot]} />
            ))}
          </View>
        </View>

        
        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle} numberOfLines={2} adjustsFontSizeToFit>
            {nickname}님의 건강고민 맞춤 영양성분 추천
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ flexDirection: 'row' }} 
            style={styles.tagScroll}
            key={selectedConcern}
          >
            {userConcerns.map((concern, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.tag, selectedConcern === concern && styles.selectedTag]} 
                onPress={() => toggleConcern(concern)}
              >
                <Text style={[styles.tagText, selectedConcern === concern && styles.selectedTagText]}>
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
              style={styles.nutrientsScroll}
            >
              {filteredNutrients.map((nutrient, index) => (
                <View key={index} style={styles.nutrientWrapper}>
                  <TouchableOpacity 
                    style={[styles.nutrientBox, selectedNutrient === nutrient.name && styles.selectedNutrient]}
                    onPress={() => handleNutrientClick(nutrient)}
                  >
                    <Image source={require('../../assets/icons/nutrientEx1.png')} style={styles.nutrientIcon} />
                    <Text style={styles.nutrientText} numberOfLines={1} ellipsizeMode="tail">
                      {nutrient.name}
                    </Text>
                    <TouchableOpacity onPress={() => toggleLike(nutrient.name)} style={styles.heartButton}>
                      <Icon 
                        name={likedNutrients[nutrient.name] ? 'heart' : 'heart-outline'}
                        size={24} 
                        color="red" 
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateToDetail(nutrient.name)} style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>상세보기</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noNutrientsBox}>
              <Text style={styles.noNutrientsText}>해당하는 영양성분이 없습니다.</Text>
            </View>
          )}

          {/* 추천 이유 창은 해당하는 영양성분이 있을 때만 표시 */}
          {selectedNutrient && filteredNutrients.length > 0 && (
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>추천 이유</Text>
              <Text style={styles.recommendationText}>{selectedReason}</Text>
            </View>
          )}

        </View>

        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.squareButton}>

            <Text style={styles.buttonText}>
              영양성분{'\n'}최고 조합{'\n'}확인하기
            </Text>

            <Image
              source={require('../../assets/icons/likes.png')}
              style={styles.icon}
            />

          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButton}>
            
            <Text style={styles.buttonText}>
              맞춤 영양성분{'\n'}복용가이드{'\n'}바로가기
            </Text>

            <Image
              source={require('../../assets/icons/guide.png')}
              style={styles.icon}
            />

          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  // Header
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 100,
    justifyContent: 'center', // 가로 중앙 정렬
    alignItems: 'flex-end', // 요소들을 아래쪽 정렬
    position: 'relative', // 내부 요소의 절대 위치 설정 가능
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    position: 'absolute',
    bottom: 10, // 부모 요소의 아래쪽에 고정
    left: '50%', // 가로 중앙 정렬
    transform: [{ translateX: -50 }], // 중앙 정렬 보정
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // 그림자 색상 (약간 어둡게)
    textShadowOffset: { width: 1, height: 1 }, // 그림자 위치
    textShadowRadius: 2, // 그림자 흐림 효과 (보더 느낌)
  },
  logoIcon: {
    width: 80,
    height: 80,
    position: 'absolute',
    bottom: 10, // 텍스트와 같은 높이로 맞춤
    left: '50%', // 텍스트 기준 중앙으로 이동
    transform: [{ translateX: -130 }], // 텍스트 기준 왼쪽으로 90px 이동
  },

  // Carousel
  carouselContainer: {
    alignItems: 'center',
    marginVertical: 10,
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
  },
  recommendationBox: {
    maxWidth: width * 0.8,
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
    borderRadius: 16,
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

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  squareButton: {
    backgroundColor: '#FFF5EE',
    alignItems: 'flex-start', // 왼쪽 정렬 (alignItems: 'left' → 'flex-start' 수정)
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 20,
    borderRadius: 10,
    width: 165,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'left', // 왼쪽 정렬 유지
    color: '#333',
    alignSelf: 'flex-start', // 세로 정렬을 위쪽으로 설정
    marginTop: 0, // 위쪽 여백 제거
  },
  icon: {
    width: 34,
    height: 34,
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  iconContainer: {
    marginBottom: 20,
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  selectedNutrient: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
  },
});

export default HomeScreen;
