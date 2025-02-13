// ManualEntryScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const ManualEntryScreen = ({ navigation }) => {
  const [medicineName, setMedicineName] = useState("");
  const [registerDate, setRegisterDate] = useState("");

  const submitMedicine = () => {
    if (!medicineName || !registerDate) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }
    // 입력한 데이터를 MedicineScreen에 전달하거나 저장하는 로직 추가
    console.log("입력된 약 정보:", medicineName, registerDate);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>약품 직접 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="약품 이름"
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <TextInput
        style={styles.input}
        placeholder="등록일 (YYYY-MM-DD)"
        value={registerDate}
        onChangeText={setRegisterDate}
      />
      <Button title="입력 완료" onPress={submitMedicine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});

export default ManualEntryScreen;
