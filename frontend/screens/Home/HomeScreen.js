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
  const [likedNutrients, setLikedNutrients] = useState({});
  const [nutrientList, setNutrientList] = useState([]);
  const [selectedReason, setSelectedReason] = useState("추천 이유를 가져오는 중...");
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

        // 기존에 저장된 좋아요 정보는 AsyncStorage에서 불러옴
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
                console.log("✅ 백엔드에서 받은 nutrientList:", json.data);
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
    if (!selectedConcern || nutrientList.length === 0) {
      console.log("🚨 selectedConcern 없음 또는 nutrientList 비어 있음");
      return;
    }

    console.log("🔍 현재 선택된 관심사:", selectedConcern);
    console.log("📝 현재 nutrientList:", nutrientList);

    const matchedNutrient = nutrientList.find(nutrient => 
      nutrient.recommendations.some(rec => {
          console.log(`📌 비교 중: rec.keyword = "${rec.keyword}", selectedConcern = "${selectedConcern}"`);
          return rec.keyword.trim().toLowerCase() === selectedConcern.trim().toLowerCase();
      })
    );

    if (!matchedNutrient) {
        console.log("⚠️ 해당 관심사에 맞는 영양소 없음!");
        setSelectedReason("추천 이유를 찾을 수 없습니다.");
        return;
    }

    const matchedReason = matchedNutrient.recommendations.find(rec => rec.keyword === selectedConcern)?.reason;
    
    console.log("🧐 매칭된 영양소:", matchedNutrient.name);
    console.log("🧐 매칭된 추천 이유:", matchedReason);

    setSelectedReason(matchedReason || "추천 이유를 가져오는 중...");
  }, [selectedConcern, nutrientList]);


  const toggleLike = async (nutrient) => {
    setLikedNutrients(prev => {
      const updatedLikes = { ...prev, [nutrient]: !prev[nutrient] };
      AsyncStorage.setItem("liked_nutrients", JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };

  const toggleConcern = (concern) => {
    setSelectedConcern(prev => (prev === concern ? null : concern));
  };

  const navigateToDetail = (nutrient) => {
    navigation.navigate('NutrientDetail', { nutrient });
  };

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

          {selectedConcern && nutrientList.length > 0 && (
            <View>
                {/* 추천 이유 표시 */}
                <View style={styles.recommendationBox}>
                    <Text style={styles.recommendationTitle}>추천 이유</Text>
                    <Text style={styles.recommendationText}>
                        {selectedReason}
                    </Text>
                </View>

                {/* 선택된 관심사에 맞는 영양소만 필터링해서 표시 */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ flexDirection: 'row' }} 
                    style={styles.nutrientsScroll}
                >
                    {nutrientList
                        .filter(nutrient => nutrient.recommendations.some(rec => rec.keyword === selectedConcern))
                        .map((nutrient, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.nutrientBox} 
                                onPress={() => navigateToDetail(nutrient.name)}
                            >
                                {/* 영양소 이미지 */}
                                <Image source={require('../../assets/icons/nutrientEx1.png')} style={styles.nutrientIcon} />

                                {/* 영양소 이름 */}
                                <Text style={styles.nutrientText} numberOfLines={1} ellipsizeMode="tail">
                                    {nutrient.name}
                                </Text>

                                {/* 하트 아이콘 (좋아요) */}
                                <TouchableOpacity onPress={() => toggleLike(nutrient.name)} style={styles.heartButton}>
                                    <Icon 
                                        name={likedNutrients[nutrient.name] ? 'heart' : 'heart-outline'}
                                        size={24} 
                                        color="red" 
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.squareButton}>

            <View style={styles.iconContainer}></View>
            <Text style={styles.buttonText}>
              영양성분{'\n'}최고조합 확인하기
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
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 100,
    justifyContent: 'flex-start',
    flexDirection: 'row', // 아이콘과 텍스트를 수평으로 나열
    alignItems: 'center',
  },
  logoText: {
    fontSize: 45, // 텍스트 크기
    fontWeight: 'bold', // 텍스트 굵기
    color: '#ffffff',
    marginTop : 15,
    
  },
  logoIcon : {
    width: 90, // 로고의 너비
    height: 90, // 로고의 높이
    marginRight: 10, // 로고와 텍스트 사이의 간격

  },
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
  recommendationSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginVertical: 10,
  },
  tagScroll: {
    marginVertical: 10,
  },
  tag: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1, // ✅ 테두리 추가
    borderColor: '#91969A', // ✅ 테두리 색상 적용
  
  },
  tagText: {
    fontSize: 14,
    color:'#s91969A',
  },
  selectedTag: {
    backgroundColor: '#FBAF8B',
    borderColor : "#FBAF8B"
  },
  selectedTagText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  squareButton: {
    backgroundColor: '#FFF5EE',
    alignItems: 'left',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 165, // 버튼의 너비
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    textAlign : 'left'
  },
  icon : {
    width: 40, // 아이콘 크기 조정
    height: 40,
    position: 'absolute', // 절대 위치 설정
    right: 10, // 오른쪽에서 10px 떨어진 곳
    bottom: 10, // 아래에서 10px 떨어진 곳
  },
  iconContainer : {
    marginBottom: 20, // 아이콘과 텍스트 사이의 간격
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  noConcernsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
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
    width: 48,
    height: 48,
    marginBottom: 5,
  },
  nutrientText: {
    fontSize: 12,
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
  recommendationBox: {
    backgroundColor: '#A4E0E580',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10, 
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color : "#117389"
  },
  recommendationText: {
    fontSize: 12,
    color: 'black',
  },
});

export default HomeScreen;
