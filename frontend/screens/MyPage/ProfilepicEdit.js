//ProfilepicEdit.js



import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker"; 
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";






const ProfilepicEdit = () => {
    const [imageUri, setImageUri] = useState(null); 
    const navigation = useNavigation();
    const route = useRoute();
    const currentProfileImage = route.params?.currentProfileImage;

    // ✅ 갤러리에서 사진 선택 함수
    const pickImage = () => {
        const options = {
            mediaType: "photo", // 📷 사진만 선택 가능하도록 설정
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log("사용자가 선택을 취소함");
            } else if (response.errorMessage) {
                console.error("에러 발생:", response.errorMessage);
            } else {
                // ✅ 선택된 이미지 저장
                const uri = response.assets[0].uri;
                setImageUri(uri);

            }
        });
    };


    // ✅ 서버에 이미지 업로드
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
                Alert.alert("완료", "사진 변경이 완료되었습니다.", [
                    { text: "확인", onPress: () => navigation.navigate("MainTabs", { screen: "MyPage" }) }
                ]);
            } else {
                Alert.alert("오류", "이미지 업로드 실패");
            }
        } catch (error) {
            console.error("❌ 이미지 업로드 오류:", error);
            Alert.alert("오류", "서버와의 통신 중 문제가 발생했습니다.");
        }
    };











    return (
        <View style={styles.container}>
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
                <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                    <Text style={styles.buttonText}>📷 갤러리에서 선택</Text>
                </TouchableOpacity>
            </View>

            {/* 확인 버튼 - Alert 후 마이페이지로 이동 */}
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
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    imageContainer: { alignItems: "center" },
    profileImage: { width: 200, height: 250, borderWidth: 1, borderColor: "lightgrey" },
    cameraButton: { marginTop: 22, backgroundColor: "#FBAF8B", padding: 10, borderRadius: 8 },
    buttonText: { color: "white", fontWeight: "bold" },
    confirmButton: { marginTop: 10, backgroundColor: "#FBAF8B", padding: 10, borderRadius: 8, width:138 },
    confirmText: { color: "white", fontWeight: "bold", textAlign:"center" },
});

export default ProfilepicEdit;
