import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/AuthContext";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native"; // ← 추가

function Settings1() {
  const { setUserData } = useContext(AuthContext);
  const navigation = useNavigation(); // ← 추가: navigation 훅 사용

  // 로그아웃
  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            setUserData(null);
          } catch (error) {
            console.error("로그아웃 오류:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 탈퇴하기
  const handleWithdraw = async () => {
    Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        onPress: async () => {
          try {
            // 여기서 실제 회원 탈퇴 API 호출 등 로직 추가
            await AsyncStorage.removeItem("token");
            setUserData(null);
            Alert.alert("알림", "탈퇴가 완료되었습니다.");
          } catch (error) {
            console.error("회원 탈퇴 오류:", error);
            Alert.alert("오류", "회원 탈퇴 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 혹은 특정 탭으로 이동 */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("MainTabs", { screen: "MyPage" });
        }}
        style={styles.backButton}
      >
        <Feather name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 탈퇴하기 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
        <Text style={styles.buttonText}>탈퇴하기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Settings1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
  },
});
