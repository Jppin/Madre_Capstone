//MedicineDetailScreen.js


import React, { useState, useEffect } from "react";
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


// 안전하게 medicine 데이터 초기화: 값이 없으면 빈 배열로 설정
let initialList = [];
if (medicine) {
  initialList = Array.isArray(medicine) ? medicine : [medicine];
}

  
  // 다중 모드 여부 판단: medicine이 배열이면 true, 아니면 false
  const isMultiMode = Array.isArray(medicine);
  
  // 다중 모드면 medicineList 상태에 배열을, 단일 모드면 배열에 단일 객체를 저장
  const [medicineList, setMedicineList] = useState(isMultiMode ? medicine : [medicine]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 현재 선택된 약품
  const currentMedicine = medicineList[currentIndex] || null;
  
  // 기본값 설정
  const defaultValue = "(알 수 없음)";
  
  // 현재 약품으로부터 초기 편집 데이터를 생성하는 함수
  const getInitialData = (med) => {
    if (!med) {
      return {
        name: defaultValue,
        pharmacy: defaultValue,
        prescriptionDate: defaultValue,
        registerDate: defaultValue,
        dosageGuide: defaultValue,
        warning: defaultValue,
        sideEffects: defaultValue,
        appearance: defaultValue,
      };
    }
    return {
      name: med.name && med.name.trim() ? med.name : defaultValue,
      pharmacy: med.pharmacy && med.pharmacy.trim() ? med.pharmacy : defaultValue,
      prescriptionDate:
        med.prescriptionDate && med.prescriptionDate.trim()
          ? med.prescriptionDate
          : defaultValue,
      registerDate:
        med.registerDate && med.registerDate.trim()
          ? med.registerDate
          : defaultValue,
      dosageGuide:
        med.dosageGuide && med.dosageGuide.trim()
          ? med.dosageGuide
          : defaultValue,
      warning:
        med.warning && med.warning.trim() ? med.warning : defaultValue,
      sideEffects:
        med.sideEffects && med.sideEffects.trim()
          ? med.sideEffects
          : defaultValue,
      appearance:
        med.appearance && med.appearance.trim()
          ? med.appearance
          : defaultValue,
    };
  };
  
  // 편집 데이터와 복용 상태는 현재 약품이 바뀔 때마다 업데이트
  const [editedData, setEditedData] = useState(getInitialData(currentMedicine));
  const [localActive, setLocalActive] = useState(() => {
    return medicineList.length > 0 && medicineList[currentIndex]
      ? medicineList[currentIndex].active
      : false;
  });
  
  const [editMode, setEditMode] = useState(false);
  


  useEffect(() => {
  if (medicineList.length > 0 && medicineList[currentIndex]) {
    setEditedData(getInitialData(medicineList[currentIndex]));
    setLocalActive(medicineList[currentIndex].active);
  } else {
    // 데이터가 없을 경우 기본값으로 설정
    setEditedData(getInitialData(null));
    setLocalActive(false);
  }
}, [currentIndex, medicineList]);
  



  // 복용 상태 토글 함수: 현재 약품 id 사용
  const toggleSwitch = async () => {
    setLocalActive((prev) => !prev);
    if (toggleMedicine && typeof toggleMedicine === "function") {
      await toggleMedicine(currentMedicine._id);
    }
    // 로컬에서 현재 약품 상태 업데이트
    const updatedList = [...medicineList];
    updatedList[currentIndex] = { ...currentMedicine, active: !currentMedicine.active };
    setMedicineList(updatedList);
  };
  
  // 수정 요청: 현재 약품의 id를 사용하여 PUT 요청을 보냄
  const handleUpdate = async () => {
    if (!currentMedicine) return;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("오류", "인증 토큰이 없습니다. 다시 로그인 해주세요.");
        return;
      }
      const response = await fetch(`http://10.0.2.2:5001/medicines/${currentMedicine._id}`, {
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
        // 현재 약품 업데이트 후 리스트에 반영
        const updatedMedicine = updatedData.medicine;
        const updatedList = [...medicineList];
        updatedList[currentIndex] = updatedMedicine;
        setMedicineList(updatedList);
      } else {
        Alert.alert("오류", "수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("수정 오류:", error);
      Alert.alert("오류", "수정 중 문제가 발생했습니다.");
    }
  };
  
  
  
  // 다중 모드일 때 이전/다음 버튼 핸들러
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditMode(false);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < medicineList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditMode(false);
    }
  };

// 만약 medicineList에 데이터가 없다면 로딩 또는 에러 메시지 표시
if (!currentMedicine) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>약품 데이터가 없습니다.</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={{ color: "#fff" }}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  );
}

  // 단순 출력 시 기본값 처리 함수
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
      
      {/* 다중 모드일 때만 이전/다음 네비게이션 버튼 표시 */}
      {isMultiMode && (
        <View style={styles.multiNav}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            style={styles.navButton}
          >
            <Text
              style={[
                styles.navButtonText,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
            >
              이전
            </Text>
          </TouchableOpacity>
          <Text style={styles.navIndicator}>
            {currentIndex + 1} / {medicineList.length}
          </Text>
          <TouchableOpacity
            onPress={handleNext}
            disabled={currentIndex === medicineList.length - 1}
            style={styles.navButton}
          >
            <Text
              style={[
                styles.navButtonText,
                currentIndex === medicineList.length - 1 && styles.navButtonDisabled,
              ]}
            >
              다음
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 약품 정보 카드 */}
          <View style={styles.medicineCard}>
            <View style={styles.medicineInfo}>
              {editMode ? (
                <TextInput
                  style={[styles.medicineName, { padding: 0 }]}
                  value={editedData.name}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, name: text })
                  }
                  multiline
                />
              ) : (
                <Text style={styles.medicineName}>{displayValue(currentMedicine.name)}</Text>
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
                <Text style={styles.value}>{displayValue(currentMedicine.pharmacy)}</Text>
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
                <Text style={styles.value}>{displayValue(currentMedicine.prescriptionDate)}</Text>
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
                <Text style={styles.value}>{displayValue(currentMedicine.registerDate)}</Text>
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
                <Text style={styles.value}>{displayValue(currentMedicine.appearance)}</Text>
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
                <Text style={styles.importantText}>{displayValue(currentMedicine.dosageGuide)}</Text>
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
                <Text style={styles.warningText}>{displayValue(currentMedicine.warning)}</Text>
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
                <Text style={styles.warningText}>{displayValue(currentMedicine.sideEffects)}</Text>
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
  multiNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navIndicator: {
    fontSize: 16,
    color: "#fff",
  },
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
  detailTable: {
    marginTop: 20,
  },
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
});

export default MedicineDetailScreen;
