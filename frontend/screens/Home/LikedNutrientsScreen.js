import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const LikedNutrientsScreen = ({ navigation }) => {
  const { getData } = useContext(AuthContext);
  const [likedNutrients, setLikedNutrients] = useState({});

  useEffect(() => {
    const fetchLiked = async () => {
      const userData = await getData();
      const userId = userData?.user?._id;
      if (!userId) return;

      const storageKey = `liked_nutrients_${userId}`;
      const storedData = await AsyncStorage.getItem(storageKey);
      const parsedData = storedData ? JSON.parse(storedData) : {};

      setLikedNutrients(parsedData);
    };

    fetchLiked();
  }, []);

  const likedList = Object.keys(likedNutrients).filter((key) => likedNutrients[key]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>찜한 영양성분 목록</Text>
      </View>

      {likedList.length > 0 ? (
        likedList.map((nutrient, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={styles.text}>{nutrient}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>찜한 영양소가 없습니다.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  item: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  text: { fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },
});

export default LikedNutrientsScreen;
