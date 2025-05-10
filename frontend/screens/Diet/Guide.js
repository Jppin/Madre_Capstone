// screens/Diet/Guide.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../context/AuthContext';



// 1. 충족도 분석 파싱
const parseAnalysisList = (guideText) => {
    const section = guideText.match(/\[하루 식단 종합 가이드\][\s\S]*?(?=\n\[[^\]]+\]|$)/)?.[0] || '';
    const analysisMatch = section.match(/- 섭취 충족도 분석:\s*([\s\S]*?)(?=\n- |$)/);
    if (!analysisMatch) return [];
  
    const content = analysisMatch[1].replace(/\n/g, ' ');
    const regex = /([가-힣A-Za-z0-9\+\- ]+?)[은는]?\s*(\d{1,3})%/g;
    const results = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      results.push({
        nutrient: match[1].trim(),
        percent: parseInt(match[2], 10),
      });
    }
    return results;
  };
  
  // 2. 추가 섭취 가이드 파싱
  const parseSupplements = (guideText) => {
    const section = guideText.match(/\[하루 식단 종합 가이드\][\s\S]*?(?=\n\[[^\]]+\]|$)/)?.[0] || '';
    const match = section.match(/- 추가 섭취 가이드:[\s\S]*?(?=\n- |$)/);
    if (!match) return { list: '', explanation: '' };
  
    const lines = match[0].split('\n').map(l => l.trim()).filter(Boolean);
    const listLine = lines.find(line => line.startsWith('• 권장 영양제'));
    const explanationLine = lines.find(line => line.startsWith('• 설명'));
  
    return {
      list: listLine ? listLine.replace('• 권장 영양제:', '').trim() : '',
      explanation: explanationLine ? explanationLine.replace('• 설명:', '').trim() : '',
    };
  };
  
  // 3. 복용 주의사항 파싱
  const parseCautions = (guideText) => {
    const section = guideText.match(/\[하루 식단 종합 가이드\][\s\S]*?(?=\n\[[^\]]+\]|$)/)?.[0] || '';
    const match = section.match(/- 복용 주의사항:[\s\S]*?(?=\n- |$)/);
    if (!match) return [];
  
    return match[0]
      .split('\n')
      .slice(1)
      .map(line => line.trim().replace(/^•\s*/, ''))
      .filter(Boolean);
  };
  






  const parseGuideSections = (guideText) => {
    return {
      analysisList: parseAnalysisList(guideText),
      supplements: parseSupplements(guideText),
      cautions: parseCautions(guideText),
    };
  };
  




const Guide = ({ route, navigation }) => {
    const { guideText } = route.params;

    console.log("📦 guideText 전체 내용 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
    console.log(guideText); // 여기가 핵심

    const parsed = parseGuideSections(guideText); 

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="chevron-left" size={32} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>식단 상세 가이드</Text>

      {/* 충족도 분석 */}
{/* 충족도 분석 */}
<View style={styles.sectionBox}>
  <Text style={styles.sectionTitle}>오늘 식단의 영양소 충족도 분석</Text>
  {parsed.analysisList.length > 0 ? (
    parsed.analysisList.map((item, idx) => (
      <View key={idx} style={styles.barGroup}>
        <Text style={styles.barLabel}>{item.nutrient}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.barFill, { width: `${item.percent}%` }]} />
        </View>
      </View>
    ))
  ) : (
    <Text style={styles.sectionText}>분석 데이터를 찾을 수 없습니다.</Text>
  )}
</View>


      {/* 추가 섭취 시도하기 */}
      <View style={styles.sectionBox}>
        <Text style={styles.highlightTitle}>💊 추가 섭취 시도하기</Text>
        <Text style={styles.sectionText}>권장 영양제:</Text>
        {parsed.supplements.list.split('\n').map((item, idx) => (
          <Text key={idx} style={styles.bullet}>- {item.trim()}</Text>
        ))}

        <Text style={styles.sectionText}>🟡 AI 설명{"\n"}{parsed.supplements.explanation}</Text>
      </View>

      {/* 복용주의사항 */}
      <View style={styles.sectionBox}>
        <Text style={styles.highlightTitle}>⚠️ 복용주의사항</Text>
        {parsed.cautions.map((item, idx) => (
          <Text key={idx} style={styles.bullet}>- {item}</Text>
        ))}
      </View>

        <View style={styles.warningBanner}>
            <Text style={styles.warningBannerText}>참고 : 임산부 금기 식품 및 성분 안내</Text>
        </View>


      {/* 위험 식품 안내 이미지 */}
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
