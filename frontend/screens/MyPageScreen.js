// screens/MyPageScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyPageScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>마이페이지</Text>
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

export default MyPageScreen;
