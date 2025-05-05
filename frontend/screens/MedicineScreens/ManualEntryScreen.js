//ManualEntryScreen.js


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Image
} from "react-native";
import createAPI from '../../api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "../../components/LoadingScreen";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
const ManualEntryScreen = () => {
  const navigation = useNavigation();
  

  // 입력 필드 상태
  const [name, setName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [dosageGuide, setDosageGuide] = useState("");
  const [warning, setWarning] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [appearance, setAppearance] = useState(""); // ✅ 추가된 성상(appearance) 필드

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultValue = "(알 수 없음)";

  // "입력완료" 버튼 클릭 시
  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("오류", "약품명을 입력하세요.");
      return;
    }
    setConfirmVisible(true);
  };

  // 확인 팝업에서 "확인" 누를 시
  const confirmSubmission = async () => {
    setConfirmVisible(false);
    setLoading(true);
    
    const api = await createAPI();
    
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("오류", "로그아웃되었습니다. 다시 로그인 해주세요.");
        setLoading(false);
        return;
      }

      // 백엔드로 보낼 데이터 구성 (appearance 포함)
      const data = {
        name: name.trim(),
        prescriptionDate: prescriptionDate.trim() ? prescriptionDate : defaultValue,
        registerDate: new Date().toISOString().split("T")[0],
        pharmacy: pharmacy.trim() ? pharmacy : defaultValue,
        dosageGuide: dosageGuide.trim() ? dosageGuide : defaultValue,
        warning: warning.trim() ? warning : defaultValue,
        sideEffects: sideEffects.trim() ? sideEffects : defaultValue,
        appearance: appearance.trim() ? appearance : defaultValue, // ✅ 성상 추가
      };

      const response = await api.post("/medicines", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.medicine) {
        // MedicineDetailScreen으로 이동
        navigation.replace("MedicineDetailScreen", {
          medicine: response.data.medicine,
        });
      } else {
        Alert.alert("실패", "약품 추가에 실패했습니다.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("같은 이름의 약품")
      ) {
        Alert.alert("오류", "이미 같은 이름의 약품이 존재합니다.");
      } else {
        Alert.alert("오류", "약품 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayValue = (value) => (value.trim() ? value : defaultValue);

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 헤더 영역에 back button 추가 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.header}>약품 직접 입력</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <Text style={styles.label}>💊 약품명 -❗필수입력❗</Text>
          <TextInput
            style={styles.input}
            placeholder="약품명을 입력하세요"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>📅 처방일</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 2025-02-24"
            value={prescriptionDate}
            onChangeText={setPrescriptionDate}
          />

          <Text style={styles.label}>🏥 처방 약국</Text>
          <TextInput
            style={styles.input}
            placeholder="약국명을 입력하세요"
            value={pharmacy}
            onChangeText={setPharmacy}
          />

          <Text style={styles.label}>🔍 성상 (appearance)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 흰색 원형 정제"
            value={appearance}
            onChangeText={setAppearance}
          />

          <Text style={styles.label}>📝 복용법</Text>
          <TextInput
            style={styles.input}
            placeholder="복용법을 입력하세요"
            value={dosageGuide}
            onChangeText={setDosageGuide}
          />

          <Text style={styles.label}>⚠️ 주의사항</Text>
          <TextInput
            style={styles.input}
            placeholder="주의사항을 입력하세요"
            value={warning}
            onChangeText={setWarning}
          />

          <Text style={styles.label}>😷 부작용</Text>
          <TextInput
            style={styles.input}
            placeholder="부작용을 입력하세요"
            value={sideEffects}
            onChangeText={setSideEffects}
          />

          
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>입력 완료</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 확인 팝업 모달 */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>입력 내용을 확인해주세요!</Text>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>💊 약품명 : {name}</Text>
              <Text style={styles.modalText}>📅 처방일 : {displayValue(prescriptionDate)}</Text>
              <Text style={styles.modalText}>🏥 처방 약국 : {displayValue(pharmacy)}</Text>
              <Text style={styles.modalText}>🔍 성상 : {displayValue(appearance)}</Text>
              <Text style={styles.modalText}>📝 복용법 : {displayValue(dosageGuide)}</Text>
              <Text style={styles.modalText}>⚠️ 주의사항 : {displayValue(warning)}</Text>
              <Text style={styles.modalText}>😷 부작용 : {displayValue(sideEffects)}</Text>
               
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalButtonText}>수정하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmSubmission}>
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    // ScrollView 내부 컨텐츠 레이아웃
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    // 헤더 영역(직사각형)
    backgroundColor: "#FBAF8B",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    flexDirection: "row",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // back button absolute 위치를 위해 필요
    marginBottom: 10,
  },

  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 1, // 다른 요소보다 위에 있게 합니다.
  },
 

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    flex: 1,
  },
  form: {
    // 폼 전체에 여백 부여
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#FF8E72",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  modalContent: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    marginLeft: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#FF8E72",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ManualEntryScreen;
