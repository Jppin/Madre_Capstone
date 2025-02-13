import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const InfoComplete = () => {
    const navigation = useNavigation();
    const { setUserData, getData, setIsNewUser } = useContext(AuthContext); // ✅ `setIsNewUser` 추가
    const [nickname, setNickname] = useState("사용자님");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saveUserDataToBackend = async () => {
            try {
                const email = await AsyncStorage.getItem("user_email");
                const storedNickname = await AsyncStorage.getItem("user_nickname");
                const birthYear = await AsyncStorage.getItem("user_birthYear");
                const gender = await AsyncStorage.getItem("user_gender");
                const alcohol = await AsyncStorage.getItem("user_alcohol") || "0";
                const smoking = await AsyncStorage.getItem("user_smoking") || "no";
                const pregnancy = await AsyncStorage.getItem("user_pregnancy") || "해당 없음";
                const conditions = JSON.parse(await AsyncStorage.getItem("user_conditions") || "[]");
                const concerns = JSON.parse(await AsyncStorage.getItem("user_concerns") || "[]");

                setNickname(storedNickname || "사용자님");

                const userData = {
                    email,
                    nickname: storedNickname,
                    birthYear: parseInt(birthYear),
                    gender,
                    alcohol: parseInt(alcohol),
                    smoking,
                    pregnancy,
                    conditions,
                    concerns,
                };

                console.log("📢 백엔드로 전송할 데이터:", userData); // ✅ 데이터 로그 확인

                // ✅ 백엔드로 사용자 데이터 저장 요청
                const response = await axios.post("http://10.0.2.2:5001/save-user-info", userData);

                if (response.data.status === "ok") {
                    console.log("✅ 사용자 데이터 저장 완료:", response.data);
                    setUserData(userData); // 앱 전역 상태에 저장
                    await AsyncStorage.setItem("isNewUser", "false"); // 온보딩 완료 설정
                } else {
                    throw new Error(response.data.message || "데이터 저장 실패");
                }
            } catch (error) {
                console.error("❌ 사용자 데이터 저장 오류:", error);
                Alert.alert("오류", "회원 정보 저장 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        saveUserDataToBackend();
    }, []);

    const handleStart = async () => {
        try {
            await AsyncStorage.setItem("isNewUser", "false");
            setIsNewUser(false); // ✅ `setIsNewUser`이 존재하지 않던 문제 해결
            getData();

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainNavigator" }], // ✅ 네비게이션 스택을 완전히 리셋
                });
            }, 500);
        } catch (error) {
            console.error("AsyncStorage 업데이트 실패:", error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#FBAF8B" />
            ) : (
                <>
                    <View style={styles.line} />
                    <Text style={styles.title}>모든 정보 입력이 완료되었어요! 🎉</Text>
                    <Text style={styles.subtitle}>
                        이제 <Text style={styles.bold}>{nickname}</Text>의 첫 번째 맞춤형{"\n"}
                        영양성분을 만나보세요!
                    </Text>
                    <View style={styles.line} />
                    <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                        <Text style={styles.startText}>시작하기</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

// ✅ 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    line: {
        width: '80%',
        height: 1,
        backgroundColor: '#D9D9D9',
        marginVertical: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    bold: {
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#FBAF8B',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 8,
        position: 'absolute',
        bottom: 40,
    },
    startText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default InfoComplete;