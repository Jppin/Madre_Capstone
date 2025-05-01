import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createAPI from '../../api';
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../../context/AuthContext";

function ChangePassword() {
  const navigation = useNavigation();
  const { setUserData } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);

  // ✅ 새 비밀번호 검증 (10자 이상, 소문자, 숫자, 특수문자 포함)
  function handleNewPassword(e) {
    const passwordVar = e.nativeEvent.text;
    setNewPassword(passwordVar);
    setPasswordValid(/^(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{10,}$/.test(passwordVar));
  }

  // ✅ 비밀번호 확인 검증
  function handleConfirmPassword(e) {
    const confirmPasswordVar = e.nativeEvent.text;
    setConfirmNewPassword(confirmPasswordVar);
    setPasswordMatch(confirmPasswordVar === newPassword && confirmPasswordVar.length > 0);
  }

  // ✅ 비밀번호 변경 요청
  const handleChangePassword = async () => {
    if (!passwordValid || !passwordMatch) {
      Alert.alert("입력 오류", "새 비밀번호를 올바르게 입력하세요.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      
      const api = await createAPI();

      const response = await api.post("/api/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "ok") {
        Alert.alert("비밀번호 변경 완료", "다시 로그인해주세요.", [
          {
            text: "확인",
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
      } else {
        Alert.alert("오류", response.data.message || "비밀번호 변경 실패");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      Alert.alert("오류", "비밀번호 변경 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="chevron-left" size={40} color="gray" />
      </TouchableOpacity>

      <Text style={styles.title}>비밀번호 변경</Text>

      {/* ✅ 현재 비밀번호 입력 */}
      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호 입력"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      {/* ✅ 새 비밀번호 입력 */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="새 비밀번호 입력"
          value={newPassword}
          onChange={handleNewPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Feather name={showPassword ? "eye" : "eye-off"} color={"grey"} size={23} />
        </TouchableOpacity>
      </View>
      {newPassword.length > 0 && !passwordValid && (
        <Text style={styles.errorText}>10자 이상, 소문자, 숫자, 특수문자 포함</Text>
      )}

      {/* ✅ 새 비밀번호 확인 */}
      <TextInput
        style={styles.input}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        value={confirmNewPassword}
        onChange={handleConfirmPassword}
      />
      {confirmNewPassword.length > 0 && !passwordMatch && (
        <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
      )}

      {/* ✅ 비밀번호 변경 버튼 */}
      <TouchableOpacity
        style={[styles.changeButton, (!passwordValid || !passwordMatch) && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={!passwordValid || !passwordMatch}
      >
        <Text style={styles.buttonText}>변경하기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 5,
    zIndex: 10,
    padding: 10,
},

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    height: 50,
  },

  eyeIcon: {
    padding: 10,
  },

  errorText: {
    marginBottom: 10,
    color: "red",
    textAlign: "left",
    alignSelf: "flex-start",
    marginLeft: 10,
  },

  changeButton: {
    backgroundColor: "#FBAF8B",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    backgroundColor: "#ccc",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
