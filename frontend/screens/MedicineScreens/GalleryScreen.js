// GalleryScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import createAPI from '../../api';
import LoadingScreen from "../../components/LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";


const GalleryScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // 컴포넌트가 마운트되면 갤러리 열기
  useEffect(() => {
    openGallery();
  }, []);

  const openGallery = () => {
    const options = {
      mediaType: "photo",
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("갤러리 선택 취소");
        navigation.goBack(); // 취소하면 이전 화면으로 이동
      } else if (response.errorMessage) {
        console.error("갤러리 오류:", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    setLoading(true);
  
    try {
      const uri = Platform.OS === "android" ? photo : photo.replace("file://", "");
      const fileName = uri.split("/").pop();
      const fileType = fileName.split(".").pop().toLowerCase();
      const mimeType =
        fileType === "jpg" || fileType === "jpeg"
          ? "image/jpeg"
          : fileType === "png"
          ? "image/png"
          : "application/octet-stream";
  
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: fileName,
        type: mimeType,
      });
  
      const token = await AsyncStorage.getItem("token");
      const api = await createAPI();
  
      console.log("📤 업로드 시작");
      console.log("📎 fileName:", fileName);
      console.log("📎 mimeType:", mimeType);
      console.log("📎 uri:", uri);
  
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        transformRequest: (data) => data,
      });
  
      console.log("✅ 서버 응답:", response.data);
  
      const saveResponse = await api.post(
        "/medicines",
        response.data.medicine,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const medicineData =
        saveResponse.data.medicine || saveResponse.data.medicines;
  
      navigation.replace("MedicineDetailScreen", {
        medicine: medicineData,
      });
    } catch (error) {
      console.error("❌ 업로드 실패:", error.message);
      if (error.response) {
        console.error("❌ 서버 응답 오류:", error.response.data);
      } else if (error.request) {
        console.error("❌ 요청은 됐지만 응답 없음:", error.request);
      } else {
        console.error("❌ 설정 오류:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>갤러리에서 사진을 선택하세요</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity onPress={uploadPhoto} style={styles.confirmButton}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  imagePreview: {
    flex: 1,
    resizeMode: "contain",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  placeholderText: {
    color: "#888",
    fontSize: 18,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  cancelButton: {
    padding: 10,
  },
  confirmButton: {
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default GalleryScreen;

