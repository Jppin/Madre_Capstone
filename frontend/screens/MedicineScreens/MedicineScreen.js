//MedicineScreen.js


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInput,
  Image,
  Modal,
  Keyboard,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createAPI from "../../api";




const MedicineScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // ✅ 화면 포커스 감지
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [updatedStatuses, setUpdatedStatuses] = useState({});



  useEffect(() => {
    if (isFocused) {
      fetchMedicines();
    }
  }, [isFocused]);








  
  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);
  
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("인증 토큰이 없습니다.");
        return;
      }
  
      const api = await createAPI();
  
      const res = await api.get("/medicines", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = res.data;
      // 🔥 수정: updatedStatuses에 반영된 복용 상태 우선 적용
    const mergedMedicines = data.map((med) =>
      updatedStatuses.hasOwnProperty(med._id)
        ? { ...med, active: updatedStatuses[med._id] }
        : med
    );

    setMedicines(Array.isArray(mergedMedicines) ? mergedMedicines : []);
  
    } catch (error) {
      console.error("약품 데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoadingMedicines(false);
    }
  };
  





  const deleteMedicine = async (id) => {
    try {
      const api = await createAPI();
  
      await api.delete(`/medicines/${id}`); // DELETE는 body 안 써도 됨
  
      // 삭제 후 최신 데이터 불러오기
      fetchMedicines();
    } catch (error) {
      console.error("약품 삭제 오류:", error);
      Alert.alert("삭제 오류", "약품 삭제 중 오류가 발생했습니다.");
    }
  };









  const [isAddMedicineModalVisible, setAddMedicineModalVisible] = useState(false); // 추가 모달 상태

  // 모달 열기
  const openAddMedicineModal = () => setAddMedicineModalVisible(true);
  // 모달 닫기
  const closeAddMedicineModal = () => setAddMedicineModalVisible(false);

  
  ////??????????????????????????????????????
  const goToCameraScreen = () => {
    closeAddMedicineModal(); // 모달 닫기
    navigation.navigate("CameraScreen");
  };

  const goToGalleryScreen = () => {
    closeAddMedicineModal();
    navigation.navigate("GalleryScreen");
  };
  
  // 직접 입력 화면으로 이동하는 함수
  const goToManualEntryScreen = () => {
    closeAddMedicineModal();
    navigation.navigate("ManualEntryScreen");
  };







  const [searchQuery, setSearchQuery] = useState("");// 🔍 검색어 상태 추가
  const [finalSearchQuery, setFinalSearchQuery] = useState(""); // 🔍 검색 실행 시 적용될 검색어
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterType, setFilterType] = useState("모든 약품");
  const [sortType, setSortType] = useState(null);



  // 🔍 돋보기 버튼 클릭 시 검색 실행
  const handleSearchSubmit = () => {
  if (!searchQuery.trim()) return;
  setFinalSearchQuery(searchQuery); // 현재 입력된 검색어를 최종 확정
  Keyboard.dismiss(); // 키보드 닫기
  };








  // ❌ 검색 초기화 (X 버튼 클릭)
  const clearSearch = () => {
  setSearchQuery("");
  setFinalSearchQuery("");
  Keyboard.dismiss();
  };









  // 정렬 함수
  const sortMedicines = (type) => {
    let sortedMedicines = [...medicines];

    if (type === "가나다순") {
      sortedMedicines.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else if (type === "날짜순(최신순)") {
        sortedMedicines.sort((a, b) => 
          new Date(b.registerDate.replace(/\./g, "-")) - new Date(a.registerDate.replace(/\./g, "-")));
    }

    setMedicines(sortedMedicines);
    setSortType(type);
    setSortVisible(false);
  };









  // 필터링된 약품 목록
  const filteredMedicines = medicines.filter((medicine) => {
    if (!medicine || !medicine.name) return false; // 🔴 name 속성이 없는 경우 필터링에서 제외
  
    const matchesFilter =
      filterType === "모든 약품" ||
      (filterType === "복용 중" && medicine.active) ||
      (filterType === "미복용" && !medicine.active) ||
      (filterType === "주의사항" && (
        (medicine.warning && medicine.warning.trim() !== "") || 
        (medicine.sideEffects && medicine.sideEffects.trim() !== "")
      ));
  
    const matchesSearch = medicine.name.toLowerCase().includes(finalSearchQuery.toLowerCase()); // 🔍 검색어가 포함된 경우만 표시
  
    return matchesFilter && matchesSearch; // 검색 & 필터 조건 모두 만족하는 경우만 표시
  });





  // 필터 선택 함수
  const applyFilter = (type) => {
    setFilterType(type);
    setFilterVisible(false);
  };







  const toggleMedicine = (id) => {
    // UI만 바꿈
    const updatedMedicines = medicines.map((medicine) =>
      medicine._id === id ? { ...medicine, active: !medicine.active } : medicine
    );
    setMedicines(updatedMedicines);
  
    // 변경 사항 기록 (기존 값 반전)
    const current = medicines.find((m) => m._id === id);
    setUpdatedStatuses((s) => ({
      ...s,
      [id]: !current.active,
    }));
  };
  
  
  


  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      if (Object.keys(updatedStatuses).length === 0) return; // 변경사항 없으면 종료
  
      try {
        const token = await AsyncStorage.getItem("token");
        const api = await createAPI();
  
        // 모든 변경사항 서버에 POST
        await Promise.all(
          Object.entries(updatedStatuses).map(([id, newActive]) =>
            api.post(`/medicines/${id}/toggle`, null, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
  
        console.log("✅ 복용 상태 변경 서버 반영 완료");
      } catch (err) {
        console.error("❌ 복용 상태 반영 실패:", err);
      }
    });
  
    return unsubscribe;
  }, [updatedStatuses]);
  








  return (
    <>
      {/* 헤더 */}
      <View style={styles.headerBackground} />

      <View style={styles.headerContainer}>
        <Text style={styles.header}>내 약품 보관함</Text>
        <View style={styles.searchContainer}>
          <TextInput 
          style={styles.searchBar} 
          placeholder="내 약 검색" 
          value={searchQuery} // 🔍 입력값 유지
          onChangeText={(text) => setSearchQuery(text)} // 🔍 검색어 변경 시 업데이트
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Image source={require("../../assets/icons/clear.png")} style={styles.clearIcon} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSearchSubmit}> 
            <Image source={require("../../assets/icons/search1.png")} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
      </View>




      {/* 본문 */}
      
      <View style={styles.container}>
        {/* 추가 및 필터 + 정렬 버튼 */}
        <View style={styles.buttonRow}>
          {/* ✅ 수정: 여기에 onPress 추가함 */}
          <TouchableOpacity style={styles.addButton} onPress={openAddMedicineModal}>
            <Text style={styles.addButtonText}>+ 약품 추가하기</Text>
          </TouchableOpacity>
          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.FSButton} onPress={() => setFilterVisible(true)}>
              <Image source={require("../../assets/icons/filter1.png")} style={styles.iconImage} />
              <Text style={styles.FSButtonText}>필터</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.FSButton} onPress={() => setSortVisible(true)}>
              <Image source={require("../../assets/icons/sort1.png")} style={styles.iconImage} />
              <Text style={styles.FSButtonText}>정렬</Text>
            </TouchableOpacity>
          </View>
        </View>






       {/* 추가 모달 */}
       <Modal visible={isAddMedicineModalVisible} transparent animationType="slide">
      <View style={{ flex: 1 }}>
      {/* 배경 오버레이: 터치 시 모달 닫힘 */}
     <TouchableOpacity
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
      onPress={closeAddMedicineModal}
        />
        {/* 모달 콘텐츠 */}
        <View style={styles.modalContainer}>
        {/* 약봉투 카메라 촬영 버튼 */}
        <TouchableOpacity style={styles.modalButton} onPress={goToCameraScreen}>
        <Image
          source={require("../../assets/icons/camera.png")}
          style={styles.modalIcon}
        />
        <View>
          <Text style={styles.modalText}>약봉투 카메라 촬영</Text>
          <Text style={styles.modalSubText}>
            약봉투가 정면에서 잘 나오도록 촬영해주세요!
          </Text>
        </View>
      </TouchableOpacity>
      {/* 일반의약품 제품 촬영 버튼 */}
      <TouchableOpacity style={styles.modalButton} onPress={goToCameraScreen}>
        <Image
          source={require("../../assets/icons/camera.png")}
          style={styles.modalIcon}
        />
        <View>
          <Text style={styles.modalText}>일반의약품 제품 촬영</Text>
          <Text style={styles.modalSubText}>
            제품명이 정면에서 잘 보이도록 촬영해주세요!
          </Text>
        </View>
      </TouchableOpacity>
      
      
      {/* 사진 앨범에서 선택 버튼 */}
      <TouchableOpacity
        style={styles.modalButton}
        onPress={goToGalleryScreen}
      >
        <Image
          source={require("../../assets/icons/gallery.png")}
          style={styles.modalIcon}
        />
        <Text style={styles.modalText}>사진 앨범에서 선택</Text>
      </TouchableOpacity>
      
      
      {/* 직접 입력 버튼 */}
      <TouchableOpacity
        style={styles.modalButton}
        onPress={goToManualEntryScreen}
      >
        <Image
          source={require("../../assets/icons/edit.png")}
          style={styles.modalIcon}
        />
        <Text style={styles.modalText}>직접 입력</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
  
 






        
        {/* 약품 리스트 */}
        {loadingMedicines ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FBAF8B" />
          </View>
        ) : filteredMedicines.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              아직 등록한 의약품이 없습니다. {"\n"} + 버튼을 눌러 추가해보세요!
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredMedicines}
            keyExtractor={(item) => String(item._id)}
            renderItem={({ item }) => (
              <MedicineCard 
              medicine={item} 
              toggleMedicine={toggleMedicine} 
              navigation={navigation}
              deleteMedicine={deleteMedicine} />
            )}
            showsVerticalScrollIndicator={false}// ✅ 스크롤바 숨기기
            contentContainerStyle={{ paddingBottom: 75 }}
          />
      )}
      </View>

      {/* 필터 팝업 메뉴 */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterVisible(false)} />
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => applyFilter("모든 약품")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>모든 약품</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter("복용 중")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>복용 중인 약품</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter("미복용")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>복용 중이지 않은 약품</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter("주의사항")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>주의사항 존재 약품</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 정렬 팝업 메뉴 */}
      <Modal visible={sortVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSortVisible(false)} />
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => sortMedicines("가나다순")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>가나다순</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sortMedicines("날짜순(최신순)")} style={styles.menuOption}>
            <Text style={styles.menuOptionText}>날짜순(최신순)</Text>
          </TouchableOpacity>
        </View>
      </Modal>





    </>
  );
};

/** 개별 약품 카드 컴포넌트 */
const MedicineCard = ({ medicine, toggleMedicine, deleteMedicine, navigation }) => {
  return (
    <View style={styles.medicineCard}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            "삭제 확인",
            "약품을 정말 삭제하시겠습니까?",
            [
              { text: "취소", style: "cancel" },
              { text: "삭제", onPress: () => deleteMedicine(medicine._id) },
            ],
            { cancelable: true }
          )
        }
      >
        <Text style={styles.deleteButtonText}>🗑</Text>
      </TouchableOpacity>

      {/* 복용 상태 원형 표시 */}
      <View style={[styles.statusCircle, medicine.active ? styles.activeStatus : styles.inactiveStatus]}>
        <Text style={styles.statusText}>{medicine.active ? "복용 중" : "미복용"}</Text>
      </View>

      {/* 약품 정보 */}
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineDate}>
          등록일: {medicine.registerDate || "날짜 없음"}
        </Text>
      </View>

      {/* 스위치 */}
      <Switch
        style={styles.medicineSwitch}
        value={medicine.active}
        onValueChange={() => toggleMedicine(medicine._id)}
        trackColor={{ false: "#E0E0E0", true: "#FBAF8B" }}
        thumbColor={"#FFF"}
      />

      {/* 상세 정보 보기 버튼 */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("MedicineDetailScreen", {
            medicine,
            toggleMedicine: () => toggleMedicine(medicine._id),
          })
        }
        style={styles.detailButtonWrapper}
      >
        <Text style={styles.detailButton}>▸ 상세 정보 보기</Text>
      </TouchableOpacity>
    </View>
  );
};
















/** 스타일 */
const styles = StyleSheet.create({

  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // 📌 헤더보다 약간 더 크게 설정
    backgroundColor: 'white', // ✅ 헤더 뒤 배경 흰색으로 설정
    zIndex: -1, // 📌 헤더 아래로 배치
  },


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
    marginVertical: 10,
  },
  searchContainer: {
    position: "relative",
    width: "100%",
  },
  searchBar: {
    width: "100%",
    backgroundColor: "#FFFFFF",
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
    transform: [{ translateY: -30 }],
    resizeMode: "contain",
  },

  clearButton: {
    position: "absolute",
    right: 40,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  clearIcon: {
    width: 18,
    height: 18,
    tintColor: "#999",
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
  statusCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activeStatus: {
    backgroundColor: "#FBAF8B",
  },
  inactiveStatus: {
    backgroundColor: "#E0E0E0",
  },
  statusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },



  medicineLeft: {
    flex: 1,
  },
  medicineMiddle: {
    flex: 1.5,
    alignItems: "flex-start",
    
  },


  
  medicineInfo: {
    flex: 1,
    marginRight: 60, // 스위치 영역 확보를 위해 오른쪽 여백 추가
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    paddingVertical: 6,
    flexWrap: "wrap",
    flexShrink: 1,
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
    top: 30,
    right: 15,
    transform: [{ scale: 1.4 }],
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




  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  menu: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuOptionText: {
    fontSize: 14,
    color: "#333",
  },




  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E0E0E0"
  },
  modalIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubText: {
    fontSize: 12,
    color: "#FF6B6B",
  },





  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FFFFFF",
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth:1,
    borderColor:"lightgrey",
    justifyContent: "center",
    alignItems: "center",

  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  
    

  

});

export default MedicineScreen;
