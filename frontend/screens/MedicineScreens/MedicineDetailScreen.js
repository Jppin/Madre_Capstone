// screens/MedicineDetailScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MedicineDetailScreen = ({ route }) => {
  const { medicine } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{medicine.name}</Text>
      <Text style={styles.info}>처방일: {medicine.date}</Text>
      <Text style={styles.info}>남은 양: {medicine.remaining}</Text>
      <Text style={styles.info}>추가 정보는 여기 들어갑니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5 },
});

export default MedicineDetailScreen;