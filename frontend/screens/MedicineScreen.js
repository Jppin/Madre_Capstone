// screens/MedicineScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MedicineScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>약 보관함 조회 페이지</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default MedicineScreen;
