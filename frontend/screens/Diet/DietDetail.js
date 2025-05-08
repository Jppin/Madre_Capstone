// screens/Diet/DietDetail.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const DietDetail = ({ route, navigation }) => {
  const { meal, content } = route.params;

  const parseSection = (text) => {
    const getBlock = (label) => {
      const regex = new RegExp(`${label}[\\s\\S]*?(?=\\n\\n|$)`, 'g');
      const match = text.match(regex);
      return match ? match[0].replace(label, '').trim() : '';
    };

    return {
      menu: getBlock('추천 메뉴:'),
      caution: getBlock('주의할 점:'),
      explanation: getBlock('설명:'),
      tips: getBlock('똑똑한 팁:'),
      betterWhen: getBlock('이런 상태라면 더 좋아요:'),
    };
  };

  const parsed = parseSection(content);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="chevron-left" size={32} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>오늘 {meal}, 나와 아기를 위한{"\n"} 가장 따뜻한 선택이에요</Text>

      <View style={styles.box}>
        <View style={styles.boxSection}>
          <Text style={styles.boxTitle}>추천 메뉴</Text>
          {parsed.menu.split('\n').map((item, idx) => (
            <Text key={idx} style={styles.boxItem}>• {item}</Text>
          ))}
        </View>
        <View style={styles.boxSection}>
          <Text style={styles.boxTitle}>⚠️ 주의사항</Text>
          {parsed.caution.split('\n').map((item, idx) => (
            <Text key={idx} style={styles.boxItem}>• {item}</Text>
          ))}
        </View>
      </View>

      <Text style={styles.sectionHeader}>🤖 AI가 말해주는 “오늘의 선택 이유”</Text>
      <Text style={styles.sectionText}>{parsed.explanation}</Text>

      <Text style={styles.sectionHeader}>🧠 똑똑한 팁</Text>
      <Text style={styles.sectionText}>{parsed.tips}</Text>

      <Text style={styles.sectionHeader}>💡 이런 상태라면 더 좋아요</Text>
      {parsed.betterWhen.split('\n').map((item, idx) => (
        <Text key={idx} style={styles.sectionBullet}>• {item}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FEF6DE',
    flex: 1,
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
