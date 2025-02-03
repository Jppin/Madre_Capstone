// screens/YoutubeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const YoutubeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>유튜브 쇼츠 추천 내역 조회 페이지</Text>
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

export default YoutubeScreen;
