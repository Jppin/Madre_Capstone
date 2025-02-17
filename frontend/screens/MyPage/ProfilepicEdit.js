//ProfilepicEdit.js



import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker"; 
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";



const ProfilepicEdit = () => {
  const [imageUri, setImageUri] = useState(null); 
  const navigation = useNavigation();
  const route = useRoute();
  const currentProfileImage = route.params?.currentProfileImage;

  // 갤러리에서 사진 선택 함수
  const pickImage = () => {
    const options = {
      mediaType: "photo", // 사진만 선택 가능
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log("사용자가 선택을 취소함");
      } else if (response.errorMessage) {
        console.error("에러 발생:", response.errorMessage);
      } else {
        // 선택된 이미지 저장
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

  // 서버에 이미지 업로드 함수
  const uploadImageToServer = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg"
      });

      const token = await AsyncStorage.getItem("token");

      const response = await fetch("http://10.0.2.2:5001/upload-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("🟢 서버 응답:", result);

      if (result.status === "ok") {
        // AsyncStorage에 새 URL 업데이트
        await AsyncStorage.setItem("profileImage", result.profileImage);
        Alert.alert("완료", "사진 변경이 완료되었습니다.", [
          { text: "확인", onPress: () => navigation.navigate("MainTabs", { screen: "MyPage" }) }
        ]);
      } else {
        Alert.alert("오류", "이미지 업로드 실패");
      }
    } catch (error) {
      console.error("❌ 이미지 업로드 오류:", error);
      Alert.alert("오류", "서버와의 통신 중 문제가 발생했습니다. 다시 한 번 시도해주세요.");
    }
  };

  // 기본 이미지로 리셋하는 함수
  const resetToDefault = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://10.0.2.2:5001/reset-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profileImage: "" })
      });
      const result = await response.json();
      console.log("🟢 리셋 응답:", result);
      if (result.status === "ok") {
        // AsyncStorage에서 기존 이미지 제거
        await AsyncStorage.removeItem("profileImage");
        Alert.alert("완료", "기본 프로필 사진으로 변경되었습니다.", [
          { text: "확인", onPress: () => navigation.navigate("MainTabs", { screen: "MyPage" }) }
        ]);
      } else {
        Alert.alert("오류", "기본 이미지 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 기본 이미지 변경 오류:", error);
      Alert.alert("오류", "서버와의 통신 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>




      {/* 상단 뒤로 가기 버튼 */}
      <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
            >
                <Feather name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>


      <Text style={styles.title}>프로필 사진 변경</Text>

      <View style={styles.imageContainer}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : currentProfileImage
              ? (typeof currentProfileImage === "string"
                  ? { uri: currentProfileImage }
                  : currentProfileImage)
              : require("../../assets/icons/capybara1.png")
          }
          style={styles.profileImage}
        />


          {/* 기본 이미지로 변경 버튼 */}
          <TouchableOpacity
        style={styles.resetButton}
        onPress={resetToDefault}
      >
        <Text style={styles.resetText}>기본 이미지로 변경</Text>
      </TouchableOpacity>





        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📷 갤러리에서 선택</Text>
        </TouchableOpacity>
      </View>







      {/* 확인 버튼 - 업로드 후 마이페이지로 이동 */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          if (imageUri) {
            uploadImageToServer(imageUri);
          } else {
            Alert.alert("알림", "갤러리에서 이미지를 선택해주세요.");
          }
        }}
      >
        <Text style={styles.confirmText}>확인</Text>
      </TouchableOpacity>

      
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 43,
    left: 10,
    zIndex: 10,
    padding: 10,
},
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  imageContainer: { alignItems: "center" },
  profileImage: { width: 180, height: 270, borderWidth: 1, borderColor: "lightgrey" },
  cameraButton: { marginTop: 10, backgroundColor: "#FBAF8B", padding: 10, borderRadius: 8, width: 200 },
  buttonText: { color: "white", fontWeight: "bold", textAlign:"center" },
  confirmButton: { marginTop: 10, backgroundColor: "#FBAF8B", padding: 10, borderRadius: 8, width: 200 },
  confirmText: { color: "white", fontWeight: "bold", textAlign:"center" },
  resetButton: { marginTop: 22, backgroundColor: "#aaa", padding: 10, borderRadius: 8, width: 200 },
  resetText: { color: "white", fontWeight: "bold", textAlign:"center" },
});

export default ProfilepicEdit;

