import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NutrientDetail = ({ route }) => {
  const { nutrient } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nutrient}</Text>
      <Text style={styles.description}>이곳에 {nutrient}에 대한 상세 정보를 추가하세요.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});

export default NutrientDetail;
