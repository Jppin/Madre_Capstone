import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const MedicineScreen = () => {
  const [medicines, setMedicines] = useState([
    { id: "1", name: "디곡신", date: "2024.10.22 처방", remaining: "10정 남음", active: true },
    { id: "2", name: "이지엔 6프...", date: "2024.10.22 처방", remaining: "10정 남음", active: false },
  ]);
  const navigation = useNavigation();

  const toggleMedicine = (id) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === id ? { ...medicine, active: !medicine.active } : medicine
      )
    );
  };

  const addMedicine = () => {
    const newMedicine = {
      id: String(medicines.length + 1),
      name: "새로운 약품",
      date: "2024.10.30 처방",
      remaining: "10정 남음",
      active: false,
    };
    setMedicines([...medicines, newMedicine]);
  };

  return (
    <>
      {/* 헤더 */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>내 약품 보관함</Text>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchBar} placeholder="내 약 검색" />
          <Icon name="search" size={24} color="#91969A" style={styles.searchIcon} />
        </View>
      </View>

      {/* 본문 */}
      <View style={styles.container}>
        {/* 추가 및 필터 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
            <Text style={styles.addButtonText}>+ 약품 추가하기</Text>
          </TouchableOpacity>
          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.FSButton}>
              <Text style={styles.FSButtonText}>필터</Text>
              <Icon name="filter-list-alt" size={24} color="#91969A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.FSButton}>
              <Text style={styles.FSButtonText}>정렬</Text>
              <Icon name="sort" size={24} color="#91969A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 약품 리스트 */}
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicineCard medicine={item} toggleMedicine={toggleMedicine} navigation={navigation} />
          )}
        />
      </View>
    </>
  );
};

/** 개별 약품 카드 컴포넌트 */
const MedicineCard = ({ medicine, toggleMedicine, navigation }) => {
  return (
    <View style={styles.medicineCard}>
      {/* 약 이름 및 상태 */}
      <View style={styles.medicineLeft}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineStatus}>{medicine.active ? "(복용 중)" : "(미복용)"}</Text>
      </View>

      {/* 처방 날짜 및 남은 개수 */}
      <View style={styles.medicineMiddle}>
        <Text style={styles.medicineDate}>{medicine.date}</Text>
        <Text style={styles.medicineRemaining}>{medicine.remaining}</Text>
      </View>

      {/* 스위치 */}
      <Switch
        style={styles.medicineSwitch}
        value={medicine.active}
        onValueChange={() => toggleMedicine(medicine.id)}
        trackColor={{ false: "#E0E0E0", true: "#FBAF8B" }} // 스위치만 주황색 적용
        thumbColor={"#FFF"} // 동그란 부분은 흰색 유지
      />

      {/* 상세 정보 보기 */}
      <TouchableOpacity onPress={() => navigation.navigate("MedicineDetailScreen", { medicine })}
        style={styles.detailButtonWrapper} // 버튼 자체 크기 제한
        >
        <Text style={styles.detailButton}>▸ 상세 정보 보기</Text>
      </TouchableOpacity>
    </View>
  );
};


/** 스타일 */
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 15,
  },
  searchContainer: {
    position: "relative",
    width: "100%",
  },
  searchBar: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  searchIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  addButton: {
    backgroundColor: "#FF8E72",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 10,
  },
  FSButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  FSButtonText: { color: "#91969A", fontSize: 14, fontWeight: "bold" },
  
  medicineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
    marginTop: 3,
    marginHorizontal: 2,
  },
  medicineLeft: {
    flex: 1,
  },
  medicineMiddle: {
    flex: 1,  // 추가된 부분
    alignItems: "flex-start",  // 왼쪽 정렬
    marginLeft: -30,  // 살짝 왼쪽으로 이동
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  medicineStatus: {
    fontSize: 14,
    color: "#666",
  },
  medicineDate: {
    fontSize: 12,
    color: "#666",
  },
  medicineRemaining: {
    fontSize: 12,
    color: "#666",
  },
  medicineSwitch: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  detailButtonWrapper: {
    position: "absolute", 
    bottom: 12, // 하단 정렬
    right: 15, // 왼쪽 정렬
  },
  detailButton: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-start",  // 하단 왼쪽 정렬
    includeFontPadding: false,  // 추가: 텍스트 자체 패딩 제거
    textAlignVertical: "center",
  },
  medicineMiddle: {
    flex: 1,
    alignItems: "flex-start",  // 왼쪽 정렬 (수정됨)
    marginLeft: 15,  // 간격 조정
  },
});


export default MedicineScreen;
