//MedicineDetailScreen.js


import React, {useState} from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const MedicineDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicine, toggleMedicine } = route.params; // 네비게이션으로 전달된 약품 정보


  // ✅ 스위치 상태를 위한 useState 추가
  const [localActive, setLocalActive] = useState(medicine.active);

//꺅

  
  // ✅ 스위치 값이 변경되었을 때 실행되는 함수
  const toggleSwitch = () => {
    setLocalActive((prev) => !prev); // 스위치 상태 변경
    toggleMedicine(medicine.id); // ✅ MedicineScreen.js와 연동!
  };


  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Image source={require("../../assets/icons/back.png")} style={styles.backIcon} />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>약품 상세정보</Text>
      </View>
      
      <View style={styles.wrapper}>
      {/* 스크롤 가능한 약품 상세 정보 */}
      <ScrollView contentContainerStyle={styles.content}showsVerticalScrollIndicator={false}>
        {/* 약품 정보 카드 */}
        <View style={styles.medicineCard}>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.medicineDate}>{medicine.date} 처방</Text>
            <Text style={styles.medicineRemaining}>{medicine.active ? "복용 중" : "미복용"}</Text>
          </View>
            
            
          <Switch 
            value={localActive} 
            onValueChange={toggleSwitch}  // 스위치 변경 가능하도록 설정
            style={styles.medicineSwitch} 
            trackColor={{ false: "#ccc", true: "#FBAF8B" }} 
            thumbColor={"#fff"} 
          />
        </View>

        {/* 약품 상세 테이블 */}
        <View style={styles.detailTable}>
          <View style={styles.row}>
            <Text style={styles.label}>약국</Text>
            <Text style={styles.value}>{medicine.pharmacy}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>처방일</Text>
            <Text style={styles.value}>{medicine.prescriptionDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>등록일자</Text>
            <Text style={styles.value}>{medicine.registerDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>성상</Text>
            <Text style={styles.value}>{medicine.appearance}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>📌 복용 안내</Text>
            <Text style={styles.importantText}>{medicine.dosageGuide}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>⚠️ 주의사항</Text>
            <Text style={styles.warningText}>{medicine.precautions}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>⚠️ 부작용</Text>
            <Text style={styles.warningText}>{medicine.sideEffects}</Text>
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
    width: "92%", // ✅ 너비
    height: "85%",
    alignSelf: "center", // ✅ 가운데 정렬
  },


  header: { backgroundColor: "#FBAF8B", padding: 15, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 10 },
  backText: { fontSize: 24, color: "#000" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  content: { flexGrow: 1, padding: 20 },

  // 약품 정보 카드
  medicineCard: { 
    backgroundColor: "#fff", padding: 20, borderRadius: 10, marginBottom: 15, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#ccc",
  },
  medicineInfo: { flex: 1 },
  medicineName: { fontSize: 22, fontWeight: "bold" },
  medicineDate: { fontSize: 14, color: "#666", marginTop: 5 },
  medicineRemaining: { fontSize: 14, color: "#333", marginTop: 5 },
  medicineSwitch: { transform: [{ scale: 1.3 }] },
  

  // 상세 테이블
  detailTable: { backgroundColor: "#f8f8f8", padding: 15, borderRadius: 8, alignSelf: "stretch" },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", // ✅ 여러 줄이 될 경우 올바르게 정렬
    flexWrap: "wrap", // ✅ 내용이 길어지면 자동 줄 바꿈
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd",
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#444" },
  value: { fontSize: 16, color: "#666" },
  importantText: { fontSize: 16, color: "#d9534f", fontWeight: "bold" }, // 복용 안내 강조
  warningText: { fontSize: 16, color: "#f0ad4e", fontWeight: "bold" }, // 주의사항 강조


  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  }
 
});

export default MedicineDetailScreen;
