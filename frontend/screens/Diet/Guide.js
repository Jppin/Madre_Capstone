// screens/Diet/Guide.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BarChart } from 'react-native-gifted-charts';


const Guide = ({ route, navigation }) => {
  console.log('route.params:', route.params)


const extractFulfillment = (text) => {
  const match = text.match(/- 섭취 충족도 분석:\s*([\s\S]*?)(?:\n- |\n\n|$)/);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map(line => line.trim().replace(/^•/, '').trim())  // "• 비타민A 100%" → "비타민A 100%"
    .map(entry => {
      const [name, value] = entry.split(/\s+/);
      return { label: name, value: parseInt(value.replace('%', '')) };
    });
  };








  const { summary, guideText } = route.params;
  const fulfillmentData = extractFulfillment(guideText);
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="chevron-left" size={32} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>식단 상세 가이드</Text>





      {/* 충족도 분석 */}
<View style={styles.sectionBox}>
  <Text style={styles.sectionTitle}>오늘의 영양소 충족도</Text>
  {(() => {
    const fulfillmentData = extractFulfillment(guideText);

    return fulfillmentData.length > 0 ? (
      <BarChart
        barWidth={22}
        noOfSections={5}
        maxValue={150}
        frontColor="#A1CDA8"
        data={fulfillmentData}
        yAxisThickness={0}
        xAxisThickness={0}
        isAnimated
        labelWidth={20}
        xAxisLabelTextStyle={{ fontSize: 12, color: '#444' }}
        hideRules
        yAxisTextStyle={{ color: '#444' }}
        spacing={25}
      />
    ) : (
      <Text style={styles.sectionText}>분석 데이터를 찾을 수 없습니다.</Text>
    );
  })()}
</View>







      {/* 추가 섭취 */}
      <View style={styles.sectionBox}>
        <Text style={styles.highlightTitle}>💊 추가 섭취 시도하기</Text>
        <Text style={styles.sectionText}>권장 영양제:</Text>
        {summary?.supplementRecommendation?.supplements.map((item, idx) => (
          <Text key={idx} style={styles.bullet}>- {item}</Text>
        ))}
        <Text style={styles.sectionText}>{"\n"}🟡 AI 설명{"\n"}{summary?.supplementRecommendation?.explanation || '해당하는 설명이 없습니다.'}</Text>
      </View>

      {/* 복용 주의사항 */}
      <View style={styles.sectionBox}>
        <Text style={styles.highlightTitle}>⚠️ 복용 주의사항</Text>
        {summary?.precautions?.map((item, idx) => (
          <Text key={idx} style={styles.bullet}>- {item}</Text>
        ))}
      </View>

      {/* 기타 안내 이미지 */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningBannerText}>참고 : 임산부 금기 식품 및 성분 안내</Text>
      </View>

      <Image source={require('../../assets/icons/dangerous11.png')} style={styles.image} />
      <Image source={require('../../assets/icons/dangerous22.png')} style={styles.image2} />
      <Image source={require('../../assets/icons/dangerous33.png')} style={styles.image3} />
      <Image source={require('../../assets/icons/dangerous44.png')} style={styles.image4} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6DE',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#215132',
    marginBottom: 20,
    textAlign: 'center'
  },
  sectionBox: {
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#215132',
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#215132'
  },
  sectionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    marginBottom: 4,
  },
  barGroup: {
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500'
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#A1CDA8',
  },
  warningBanner: {
    backgroundColor: '#D94D3A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 2,
    marginTop: 8,
    
  },
  warningBannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image2: {
    width: '100%',
    height: 155,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image3: {
    width: '100%',
    height: 125,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image4: {
    width: '100%',
    height: 175,
    resizeMode: 'cover',
    marginBottom: 40,
    
  },
  image11: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image22: {
    width: '100%',
    height: 155,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image33: {
    width: '100%',
    height: 125,
    resizeMode: 'cover',
    marginBottom: 2,
    
  },
  image44: {
    width: '100%',
    height: 175,
    resizeMode: 'cover',
    marginBottom: 40,
    
  },
});

export default Guide;
