//CameraScreen.js


import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, PermissionsAndroid } from "react-native";
import { launchCamera } from "react-native-image-picker";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";


const CameraScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "카메라 사용 권한",
          message: "이 앱은 카메라를 사용하여 사진을 찍습니다.",
          buttonNeutral: "나중에",
          buttonNegative: "취소",
          buttonPositive: "허용",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("카메라 권한 허용됨");
        takePhoto(); // 자동으로 카메라 실행
      } else {
        console.log("카메라 권한 거부됨");
      }
    }
  };

  const takePhoto = () => {
    const options = {
      mediaType: "photo",
      cameraType: "back",
      quality: 1,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("사용자가 취소했습니다.");
        navigation.goBack(); // 사용자가 취소하면 이전 화면으로 이동
      } else if (response.errorMessage) {
        console.log("에러 발생:", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    setLoading(true);
  
    const formData = new FormData();
    let fileName = photo.split("/").pop(); // 파일명 추출
    let fileType = fileName.split(".").pop(); // 확장자 추출
  
    formData.append("image", {
      uri: Platform.OS === "android" ? photo : photo.replace("file://", ""), // iOS에서는 `file://` 제거
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      console.log("📤 업로드 시작:", formData);
      const response = await axios.post("http://10.0.2.2:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("서버 응답:", response.data);


      // ✅ OCR 결과를 서버에 저장 (약 추가 API 호출)
      const token = await AsyncStorage.getItem("token"); // 인증 토큰 가져오기
      if (!token) return;

      const saveResponse = await axios.post(
        "http://10.0.2.2:5001/medicines", response.data.medicine, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // 여기서 saveResponse.data.medicine는 MongoDB에 저장된 약품 객체이며 _id가 포함됨.
      const medicineData = saveResponse.data.medicine || saveResponse.data.medicines;
      navigation.replace("MedicineDetailScreen", { medicine: medicineData });
    } catch (error) {
      console.error("업로드 실패:", error);
    } finally {
      setLoading(false); // ✅ 로딩 종료
    }
  };





  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.camera} />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderText}>사진을 촬영하세요</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
              <View style={styles.innerCircle} />
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
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
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
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "black",
  },
});

export default CameraScreen;
