import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logo}>NutriBox</Text>
      </View>

      <View style={styles.carouselContainer}>
        <PagerView style={styles.pagerView} initialPage={0}>
          <View key="1">
            <Image source={require('../assets/image1.jpg')} style={styles.image} />
          </View>
          <View key="2">
            <Image source={require('../assets/image2.jpg')} style={styles.image} />
          </View>
          <View key="3">
            <Image source={require('../assets/image3.jpg')} style={styles.image} />
          </View>
        </PagerView>
      </View>

      <View style={styles.recommendationSection}>
        <Text style={styles.sectionTitle}>관심사 맞춤 영양성분 추천</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          {[].map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationText}>추천 성분: 1일 보습+손상 케어가 피부 개선을 돕는 좋은 선택이에요.</Text>
        </View>

        <View style={styles.nutrientsContainer}>
          {['카테킨', '콜라겐', '아르기닌', '오메가3'].map((nutrient, index) => (
            <TouchableOpacity key={index} style={styles.nutrientBox}>
              <Text style={styles.nutrientText}>{nutrient}</Text>
              <Icon name='heart-outline' size={20} color="red" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🧐 추천 & 비추천 성분 확인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📖 맞춤 영양성분 복용가이드</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
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
  recommendationSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  recommendationBox: {
    backgroundColor: '#DFF5FF',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  recommendationText: {
    fontSize: 14,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  nutrientBox: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '22%',
  },
  nutrientText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#FFF5EE',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});

export default HomeScreen;
