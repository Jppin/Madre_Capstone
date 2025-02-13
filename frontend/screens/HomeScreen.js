import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext"; 

function HomeScreen() {
  const { userData, loading, setUserData, getData } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    getData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
            text: "로그아웃",
            onPress: async () => {
                try {
                    await AsyncStorage.removeItem("token");

                    setUserData(null); // ✅ StackNavigator에서 자동으로 화면 변경됨
                } catch (error) {
                    console.error("로그아웃 오류:", error);
                    Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
                }
            },
        },
    ]);
};

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        케어 센터{" "}
        {loading ? "로딩 중..." : userData ? ` ${userData.email}` : "데이터 없음"}
      </Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 5,
    width: "60%",
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
  },
});

export default HomeScreen;
