//MedicineDetailScreen.js


import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";

const MedicineDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine, toggleMedicine } = route.params;
  
  
  console.log("MedicineDetailScreen received medicine:", medicine);

  const defaultValue = "(알 수 없음)";

  // 초기 데이터: 각 필드가 비어있으면 기본값 할당
  const initialData = {
    name: medicine.name && medicine.name.trim() ? medicine.name : defaultValue,
    pharmacy: medicine.pharmacy && medicine.pharmacy.trim() ? medicine.pharmacy : defaultValue,
    prescriptionDate: medicine.prescriptionDate && medicine.prescriptionDate.trim() ? medicine.prescriptionDate : defaultValue,
    registerDate: medicine.registerDate && medicine.registerDate.trim() ? medicine.registerDate : defaultValue,
    dosageGuide: medicine.dosageGuide && medicine.dosageGuide.trim() ? medicine.dosageGuide : defaultValue,
    warning: medicine.warning && medicine.warning.trim() ? medicine.warning : defaultValue,
    sideEffects: medicine.sideEffects && medicine.sideEffects.trim() ? medicine.sideEffects : defaultValue,
    appearance: medicine.appearance && medicine.appearance.trim() ? medicine.appearance : defaultValue,
  };

  // 수정 모드 여부와 수정할 데이터 상태
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(initialData);
  const [localActive, setLocalActive] = useState(medicine.active);

  const toggleSwitch = async () => {
    setLocalActive((prev) => !prev);
    await toggleMedicine(medicine._id);
  };







  // 수정 완료 후 업데이트 요청 및 페이지 reload
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("오류", "인증 토큰이 없습니다. 다시 로그인 해주세요.");
        return;
      }
      // PUT 요청: 모든 필드가 기본값 또는 수정된 값으로 보내짐
      console.log("PUT 요청할 _id:", medicine._id);  // _id가 제대로 있는지 확인
      const response = await fetch(`http://10.0.2.2:5001/medicines/${medicine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        Alert.alert("완료", "약품 정보가 수정되었습니다.");
        setEditMode(false);
        navigation.replace("MedicineDetailScreen", {
          medicine: updatedData.medicine,
          toggleMedicine: toggleMedicine,
        });
      } else {
        Alert.alert("오류", "수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("수정 오류:", error);
      Alert.alert("오류", "수정 중 문제가 발생했습니다.");
    }
  };

  // displayValue 함수: 화면에 출력할 때 사용 (수정 모드가 아닐 때)
  const displayValue = (value) =>
    value && value.trim().length > 0 ? value : defaultValue;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require("../../assets/icons/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약품 상세정보</Text>
        {editMode ? (
          <TouchableOpacity onPress={handleUpdate} style={styles.editButton}>
            <Text style={styles.editButtonText}>수정 완료</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 약품 정보 카드 */}
          <View style={styles.medicineCard}>
            <View style={styles.medicineInfo}>
              {editMode ? (
                <TextInput
                  style={[styles.medicineName, { padding: 0 }]}
                  value={editedData.name}
                  onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                  multiline
                />
              ) : (
                <Text style={styles.medicineName}>{displayValue(medicine.name)}</Text>
              )}
              <Text style={styles.medicineRemaining}>
                {localActive ? "(복용 중)" : "(미복용)"}
              </Text>
            </View>
            <Switch
              style={styles.medicineSwitch}
              value={localActive}
              onValueChange={toggleSwitch}
              trackColor={{ false: "#ccc", true: "#FBAF8B" }}
              thumbColor={"#fff"}
            />
          </View>

          {/* 약품 상세 테이블 */}
          <View style={styles.detailTable}>
            <View style={styles.row}>
              <Text style={styles.label}>약국</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.pharmacy}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, pharmacy: text })
                  }
                />
              ) : (
                <Text style={styles.value}>{displayValue(medicine.pharmacy)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>처방일</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.prescriptionDate}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, prescriptionDate: text })
                  }
                />
              ) : (
                <Text style={styles.value}>{displayValue(medicine.prescriptionDate)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>등록일자</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.registerDate}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, registerDate: text })
                  }
                />
              ) : (
                <Text style={styles.value}>{displayValue(medicine.registerDate)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>성상</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.appearance}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, appearance: text })
                  }
                />
              ) : (
                <Text style={styles.value}>{displayValue(medicine.appearance)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>📌 복용 안내</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.dosageGuide}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, dosageGuide: text })
                  }
                />
              ) : (
                <Text style={styles.importantText}>{displayValue(medicine.dosageGuide)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>⚠️ 주의사항</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.warning}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, warning: text })
                  }
                />
              ) : (
                <Text style={styles.warningText}>{displayValue(medicine.warning)}</Text>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>⚠️ 부작용</Text>
              {editMode ? (
                <TextInput
                  style={styles.valueInput}
                  value={editedData.sideEffects}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, sideEffects: text })
                  }
                />
              ) : (
                <Text style={styles.warningText}>{displayValue(medicine.sideEffects)}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBAF8B" },
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    margin: 20,
    width: "92%",
    height: "85%",
    alignSelf: "center",
  },
  header: {
    backgroundColor: "#FBAF8B",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 10 },
  backIcon: { width: 24, height: 24, resizeMode: "contain" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", flex: 1 },
  editButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: { color: "#FBAF8B", fontSize: 14, fontWeight: "bold" },
  updateButton: {
    backgroundColor: "#FF8E72",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  updateButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  content: { flexGrow: 1, padding: 20 },
  medicineCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  medicineInfo: { flex: 1, marginRight: 60 },
  medicineName: {
    fontSize: 22,
    fontWeight: "bold",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  medicineRemaining: { fontSize: 14, color: "#FBAF8B", marginTop: 5 },
  medicineSwitch: { transform: [{ scale: 1.3 }] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#444" },
  value: { fontSize: 16, color: "#666" },
  importantText: { fontSize: 16, color: "#d9534f", fontWeight: "bold" },
  warningText: { fontSize: 16, color: "#f0ad4e", fontWeight: "bold" },
  valueInput: {
    fontSize: 16,
    color: "#666",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContent: { marginBottom: 20 },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    marginLeft: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  detailButtonWrapper: { position: "absolute", bottom: 12, right: 15 },
  detailButton: {
    fontSize: 12,
    color: "#666",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#ff4d4d",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 2,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MedicineDetailScreen;




