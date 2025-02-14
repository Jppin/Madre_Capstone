import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { StyleSheet } from "react-native";

const MyPageScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* 페이지 제목 */}
      <Text style={styles.pageTitle}>마이페이지</Text>
      <View style={styles.separator} />
      
      {/* 프로필 영역 */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={require("../../assets/icons/capybara1.png")}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Image source={require("../../assets/icons/camera.png")} style={styles.cameraIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileTextContainer}>
          <View style={styles.profileRow}>
            <Text style={styles.username}>띵똥땅</Text>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/pencil.png")} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userInfo}>24세 / 여성</Text>
        </View>
      </View>






      {/* 건강 상태 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>현재 건강 상태</Text>
            <Text style={styles.infoCount}>0</Text>
          </View>
        </View>
        
        <View style={styles.infoDetailRow}>
        <Text style={styles.infoDetail}>해당사항없음</Text>
        <TouchableOpacity>
            <Image source={require("../../assets/icons/pencil.png")} style={styles.editIcon2} />
          </TouchableOpacity>
          </View>
        <View style={styles.separator} />



        <View style={styles.infoRow}>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>만성질환</Text>
            <Text style={styles.infoCount}>1</Text>
          </View>
        </View>

        <View style={styles.infoDetailRow}>
        <Text style={styles.infoDetail}>비만</Text>
        <TouchableOpacity>
            <Image source={require("../../assets/icons/pencil.png")} style={styles.editIcon2} />
          </TouchableOpacity>
          </View>
        <View style={styles.separator} />




        <View style={styles.infoRow}>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>건강고민</Text>
            <Text style={styles.infoCount}>7</Text>
          </View>
        </View>

        <View style={styles.infoDetailRow}>
        <Text style={styles.infoDetail}>눈건강, 장건강, 체지방 개선, 피부건강...</Text>
        <TouchableOpacity>
            <Image source={require("../../assets/icons/pencil.png")} style={styles.editIcon2} />
          </TouchableOpacity>
          </View>
        <View style={styles.separator} />




        <View style={styles.infoRow}>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoLabel}>복용약물</Text>
            <Text style={styles.infoCount}>2</Text>
          </View>
        </View>

        <View style={styles.infoDetailRow}>
        <Text style={styles.infoDetail}>디고신정, 이지엔6프로연질캡슐</Text>
        <TouchableOpacity>
            <Image source={require("../../assets/icons/pencil.png")} style={styles.editIcon2} />
          </TouchableOpacity>
          </View>
      </View>
      <View style={styles.separator} />

      {/* 설정 메뉴 */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Image source={require("../../assets/icons/settings.png")} style={styles.menuIcon} />
          <Text style={styles.menuText}>내 계정 관리</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.menuItem}>
          <Image source={require("../../assets/icons/paper.png")} style={styles.menuIcon} />
          <Text style={styles.menuText}>서비스 이용약관</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.menuItem}>
          <Image source={require("../../assets/icons/privacy.png")} style={styles.menuIcon} />
          <Text style={styles.menuText}>개인정보 처리 방침</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.menuItem}>
          <Image source={require("../../assets/icons/bell.png")} style={styles.menuIcon} />
          <Text style={styles.menuText}>알림 설정</Text>
          <Image source={require("../../assets/icons/rightarrow.png")} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  pageTitle: { fontSize: 24, fontWeight: "bold", textAlign: "left", marginInlineStart: 15, marginTop: 20 },
  separator: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  profileContainer: { flexDirection: "row", padding: 20, alignItems: "center" },
  profileImageWrapper: { position: "relative" },
  profileImage: { width: 100, height: 150, borderWidth: 1, borderRadius: 10, borderColor: "lightgrey" },
  cameraButton: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#fff", borderRadius: 15, padding: 5 },
  cameraIcon: { width: 20, height: 20 },
  profileTextContainer: { marginLeft: 15 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  username: { fontSize: 18, fontWeight: "bold", marginBottom:10 },
  userInfo: { fontSize: 14, color: "#777" },
  editIcon: { width: 20, height: 20, marginLeft: 10, marginBottom:10 },
  
  
  
  editIcon2: { width: 20, height: 20, marginLeft: 10,},
  infoContainer: { padding: 25, backgroundColor: "#F7F7F7", borderRadius: 10, margin: 10, borderWidth: 1, borderColor: "lightgrey" },
  infoLabel: { fontSize: 16, fontWeight: "bold", marginBottom:2, marginTop:10 },
  infoCount: { fontSize: 14, fontWeight: "bold", color: "red", marginBottom:2, marginTop:10, marginLeft:10 },
  infoDetail: { fontSize: 14, color: "#555", marginTop: 5 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoTextWrapper: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  infoDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  
  
  menuContainer: { padding: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, justifyContent: "space-between" },
  menuIcon: { width: 24, height: 24, marginRight: 20, marginLeft: 10 },
  menuText: { fontSize: 16, flex: 1 },
  arrowIcon: { width: 20, height: 20 }
});

export default MyPageScreen;