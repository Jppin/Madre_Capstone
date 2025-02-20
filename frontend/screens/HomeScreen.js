import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const images = [
    require('../assets/image1.jpg'),
    require('../assets/image2.jpg'),
    require('../assets/image3.jpg')
  ];
  const [pageIndex, setPageIndex] = useState(0);
  const pagerRef = useRef(null);
  const navigation = useNavigation();
  const { getData } = useContext(AuthContext);
  const [nickname, setNickname] = useState("");
  const [userConcerns, setUserConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [likedNutrients, setLikedNutrients] = useState({});

  const allNutrients = ['카테킨', '콜라겐', '아르기닌', '오메가3'];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (pageIndex + 1) % images.length;
      setPageIndex(nextIndex);
      pagerRef.current?.setPage(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [pageIndex, images.length]);

  useEffect(() => {
    if (userConcerns.length > 0 && !selectedConcern) {
      setSelectedConcern(userConcerns[0]);
  }
    const fetchUserData = async () => {
      try {
          const storedNickname = await AsyncStorage.getItem("user_nickname");
          const storedConcerns = await AsyncStorage.getItem("user_concerns");
          const storedLikes = await AsyncStorage.getItem("liked_nutrients");
          setNickname(storedNickname || "사용자");
          const parsedConcerns = storedConcerns ? JSON.parse(storedConcerns) : [];
          setUserConcerns(parsedConcerns);
          if (parsedConcerns.length > 0) {
              setSelectedConcern(parsedConcerns[0]);
          }
          setLikedNutrients(storedLikes ? JSON.parse(storedLikes) : {});
      } catch (error) {
          console.error("데이터 불러오기 오류:", error);
      }
    };

    fetchUserData();
    if (userConcerns.length > 0) {
      setSelectedConcern(userConcerns[0]);
    }
  }, []);

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
      <Text style={styles.logo}>NutriBox</Text>
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
            {nickname}님의 건강 고민에 딱 맞는 영양성분 추천
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {userConcerns.length > 0 ? (
              userConcerns.map((tag, index) => (

                <TouchableOpacity key={index} style={[styles.tag, selectedConcern === tag && styles.selectedTag]} onPress={() => toggleConcern(tag)}>
                  <Text style={[styles.tagText, selectedConcern === tag && styles.selectedTagText]}>{tag}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noConcernsText}>마이페이지에서 건강고민 키워드를 추가해보세요!</Text>
            )}
          </ScrollView>

          {selectedConcern && (

            <View>
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>추천 이유</Text>
                <Text style={styles.recommendationText}>이 영양성분은 건강 유지에 도움이 됩니다.</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row' }} style={styles.nutrientsScroll}>
                {allNutrients.map((nutrient, index) => (
                  <TouchableOpacity key={index} style={styles.nutrientBox} onPress={() => navigateToDetail(nutrient)}>
                    <Image source={require('../assets/icons/nutrientEx1.png')} style={styles.nutrientIcon} />
                    <Text style={styles.nutrientText} numberOfLines={1} ellipsizeMode="tail">{nutrient}</Text>

                    {/* 하트 아이콘을 우측 상단에 고정 */}
                    <TouchableOpacity onPress={() => toggleLike(nutrient)} style={styles.heartButton}>
                      <Icon 
                        name={likedNutrients[nutrient] ? 'heart' : 'heart-outline'}
                        size={24} 
                        color="red" 
                      />
                    </TouchableOpacity>
                </TouchableOpacity>

                ))}
              </ScrollView>
            </View>

          )}
        </View>

        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.buttonText}>{nickname}님 추천 & 비추천 성분 확인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.buttonText}>{nickname}님 맞춤 영양성분 복용가이드</Text>
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#E8F1FA',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectedTag: {
    backgroundColor: '#007AFF',
  },
  selectedTagText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  squareButton: {
    backgroundColor: '#FFF5EE',
    padding: 20,
    borderRadius: 10,
    width: '45%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
  },
  
});

export default HomeScreen;
