import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInput,
  Image,  // 추가: 아이콘 이미지 사용
} from "react-native";
import { useNavigation } from "@react-navigation/native";

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
          <Image source={require("../../assets/icons/search1.png")} style={styles.searchIcon} />
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
              <Image source={require("../../assets/icons/filter1.png")} style={styles.iconImage} />
              <Text style={styles.FSButtonText}>필터</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.FSButton}>
              <Image source={require("../../assets/icons/sort1.png")} style={styles.iconImage} />
              <Text style={styles.FSButtonText}>정렬</Text>
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
    paddingRight: 40,  // 아이콘과 텍스트 간격 유지
  },
  searchIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    width: 20,
    height: 20,
    transform: [{ translateY: -10 }],
    resizeMode: "contain",
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1, // 회색 테두리 추가
    borderColor: "#D1D1D1", // 연한 회색 테두리 색상
    
  },
  FSButtonText: { color: "#91969A", fontSize: 14, fontWeight: "bold" },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  medicineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 5 }, // → 오른쪽 + 아래 방향으로 그림자 이동
    shadowOpacity: 0.12, // → 그림자 투명도 조정 (더 연하게 가능)
    shadowRadius: 10, // → 그림자 퍼지는 정도
    elevation: 5, // → 안드로이드에서도 비슷한 효과 적용
    marginBottom: 10,
    marginTop: 3,
    marginHorizontal: 4,
  },
  medicineLeft: {
    flex: 1,
  },
  medicineMiddle: {
    flex: 1.5,
    alignItems: "flex-start",
    
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
    bottom: 12,
    right: 15,
  },
  detailButton: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-start",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

export default MedicineScreen;
