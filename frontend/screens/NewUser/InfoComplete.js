//InfoComplete.js

import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const InfoComplete = () => {
    const navigation = useNavigation();
    const { setUserData, getData, setIsNewUser } = useContext(AuthContext);
    const [nickname, setNickname] = useState("사용자님");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saveUserDataToBackend = async () => {
            try {
                const email = await AsyncStorage.getItem("user_email");
                const storedNickname = await AsyncStorage.getItem("user_nickname");
                const birthYear = await AsyncStorage.getItem("user_birthYear");
                const exercise = await AsyncStorage.getItem("user_exercise") || "0";
                const pregnancy = await AsyncStorage.getItem("user_pregnancy") || "해당 없음";
                const conditions = JSON.parse(await AsyncStorage.getItem("user_conditions") || "[]");
                const concerns = JSON.parse(await AsyncStorage.getItem("user_concerns") || "[]");
                const subPregnancy = await AsyncStorage.getItem("user_subPregnancy");
                const pregnancyWeek = await AsyncStorage.getItem("user_pregnancyWeek");
                const nausea = await AsyncStorage.getItem("user_nausea") || "0";
                const weightBefore = await AsyncStorage.getItem("user_weightBefore");
                const height = await AsyncStorage.getItem("user_height");
                const weight = await AsyncStorage.getItem("user_weight");

                setNickname(storedNickname || "사용자님");

                const userData = {
                    email,
                    nickname: storedNickname,
                    birthYear: parseInt(birthYear),
                    height: parseFloat(height),            // ✅ 추가
                    weight: parseFloat(weight),            // ✅ 추가
                    weightBefore: parseFloat(weightBefore),// ✅ 추가
                    exercise: parseInt(exercise),
                    pregnancy,
                    subPregnancy,
                    pregnancyWeek: parseInt(pregnancyWeek), // 숫자로
                    nausea: parseInt(nausea),
                    conditions,
                    concerns,
                };

                console.log("📢 백엔드로 전송할 데이터:", userData);

                // ✅ 백엔드로 사용자 데이터 저장 요청
                const response = await axios.post("http://10.0.2.2:5001/save-user-info", userData);

                if (response.data.status === "ok") {
                    console.log("✅ 사용자 데이터 저장 완료:", response.data);
                    
                    // ✅ AsyncStorage & AuthContext 동기화
                    
                    setUserData(userData); // 앱 전역 상태 업데이트
                } else {
                    throw new Error(response.data.message || "데이터 저장 실패");
                }
            
            } catch (error) {
                console.error("❌ 사용자 데이터 저장 오류:", error);
                Alert.alert("오류", "회원 정보 저장 중 문제가 발생했습니다.");
            } finally {
                setLoading(false); // ⬅️ 여기서만 로딩 false로 변경
            }
        };

        saveUserDataToBackend();
    }, []);





    const updateIsNewUserInDB = async (email) => {
        try {
            console.log("📢 DB의 isNewUser 상태를 false로 업데이트 중...");

            const response = await axios.post("http://10.0.2.2:5001/update-isnewuser", {
                email,
                isNewUser: false,  // DB 업데이트 요청
            });

            if (response.data.status === "ok") {
                console.log("✅ DB의 isNewUser 업데이트 완료!");
            } else {
                throw new Error(response.data.message || "DB 업데이트 실패");
            }
        } catch (error) {
            console.error("❌ DB 업데이트 오류:", error);
        }
    };




    const handleStart = async () => {
        try {
            const email = await AsyncStorage.getItem("user_email");

            await AsyncStorage.setItem("isNewUser", "false");
            setIsNewUser(false);

            // ✅ `DB`에 `isNewUser: false`로 업데이트
            if (email) {
                await updateIsNewUserInDB(email);
            }

            // ✅ `getData()`를 실행해서 AuthContext 업데이트
            await getData(); 

            // ✅ 네비게이션 스택을 완전히 리셋 (딜레이 없이 즉시 실행)
            navigation.reset({
                index: 0,
                routes: [{ name: "MainNavigator" }],
            });

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
                
                <Image source={require('../../assets/icons/complete.png')} style={styles.image} />
                    <View style={styles.line} />
                    
                    <Text style={styles.title}>모든 정보 입력이 완료되었어요! 🎉</Text>
                    <Text style={styles.subtitle}>
                        이제 <Text style={styles.bold}>{nickname}</Text>님의 첫 번째 맞춤형{"\n"}
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
        bottom: 90,
    },
    startText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 210,
        height: 210,
        resizeMode: 'contain',
        marginBottom: 8,
      },
});

export default InfoComplete;
