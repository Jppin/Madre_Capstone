// screens/Diet/DietDetail.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';





const DietDetail = ({ route, navigation }) => {
  
  
const { meal, content } = route.params;

const parsed = {
  menu: content.menu || '',
  caution: content.warning || '',
  explanation: content.explanation || '',
  betterWhen: content.benefit || '',
  tips: content.smartTip || '',
};


  return (
    <ScrollView style={styles.container}>
      <View >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={32} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>오늘 {meal}, 나와 아기를 위한{"\n"} 가장 따뜻한 선택이에요</Text>

        <View style={styles.box}>
          <View style={styles.boxSection}>
            <Text style={styles.boxTitle}>추천 메뉴</Text>
                  {parsed.menu
                      .split('\n')
                      .map((item, idx) => item.trim())  // 앞뒤 공백 제거
                      .filter(item => item && item !== '-' && item !== '•' && item !== '• -')  // 빈 항목 제거
                      .map((item, idx) => (
              <Text key={idx} style={styles.boxItem}>• {item.replace(/^[-•]\s*/, '')}</Text>  // 앞에 붙은 하이픈 제거
          ))}

          </View>
          <View style={styles.boxSection}>
            <Text style={styles.boxTitle}>⚠️ 주의사항</Text>
            {parsed.caution
              .split('\n')
              .map(item => item.trim())
              .filter(item => item && item !== '-' && item !== '•' && item !== '• -')
              .map((item, idx) => (
              <Text key={idx} style={styles.boxItem}>• {item.replace(/^[-•]\s*/, '')}</Text>
              ))}

          </View>
        </View>

        <Text style={styles.sectionHeader}>🤖 AI가 말해주는 “오늘의 선택 이유”</Text>
          {parsed.explanation
              .split('\n')
              .map(item => item.trim())
              .filter(item => item && item !== '-' && item !== '•' && item !== '• -')
              .map((item, idx) => (
              <Text key={idx} style={styles.sectionText}>• {item.replace(/^[-•]\s*/, '')}</Text>
          ))}


          <View style={{ height: 16 }} />

          {parsed.tips?.trim() ? (
          <>
              <Text style={styles.sectionHeader}>🧠 똑똑한 팁</Text>
              {parsed.tips
              .split('\n')
              .map(item => item.trim())
              .filter(item => item && item !== '-' && item !== '•' && item !== '• -')
              .map((item, idx) => (
              <Text key={idx} style={styles.sectionText}>• {item.replace(/^[-•]\s*/, '')}</Text>
          ))}
          </>
          ) : null}

          <View style={{ height: 16 }} />


          {parsed.betterWhen?.trim() ? (
          <>
              <Text style={styles.sectionHeader}>💡 이런 상태라면 더 좋아요</Text>
              {parsed.betterWhen
                  .split('\n')
                  .map(item => item.trim())
                  .filter(item => item && item !== '-' && item !== '•' && item !== '• -')
                  .map((item, idx) => (
              <Text key={idx} style={styles.sectionBullet}>• {item.replace(/^[-•]\s*/, '')}</Text>
          ))}
          </>
          ) : null}
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FEF6DE',
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#215132',
    textAlign: 'center',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#FFFBF2',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  boxSection: {
    flex: 1,
    marginRight: 10,
  },
  boxTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  boxItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  sectionBullet: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 4,
  },
});

export default DietDetail;
