//AlcoholSmoking.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, response } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from "react-native-vector-icons/Feather";

const AlcoholSmoking = () => {
    const navigation = useNavigation();

    

    // ✅ 상태 관리 (사용자 입력)
    const [alcohol, setAlcohol] = useState(0); // 음주 횟수
    const [smoking, setSmoking] = useState(null); // 흡연 여부
    const [pregnancy, setPregnancy] = useState(null); // 임신 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지

    



    // ✅ MongoDB에 정보 업데이트하는 함수
    const updateUserInfo = async () => {
        

        if (smoking === null || pregnancy === null) {
            setErrorMessage('모든 질문에 답해주세요.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("오류", "로그인이 필요합니다.");
                return;
            }

        


            const updateData = {
                alcohol,
                smoking,
                pregnancy
            };
        
            console.log("🔵 업데이트 요청 데이터:", updateData); // ✅ 전송 데이터 확인





            const response = await fetch("http://10.0.2.2:5001/update-user-info", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });




            // 🚨 응답이 정상인지 확인
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        // ✅ 서버 응답 처리
        const result = await response.json();
        console.log("🟢 서버 응답:", result);

        if (result.status === "ok") {
            console.log("✅ 사용자 정보 업데이트 성공!");

            // ✅ 업데이트 성공 시 AsyncStorage에도 반영
            await AsyncStorage.setItem("user_alcohol", String(alcohol));
            await AsyncStorage.setItem("user_smoking", smoking);
            await AsyncStorage.setItem("user_pregnancy", pregnancy);

            // ✅ 성공 메시지 표시 후 MyPage로 이동
            Alert.alert("완료", "정보가 수정되었습니다.", [
                { text: "확인", onPress: () => {
                                        navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: "MainNavigator" }], // ✅ 탭 네비게이터를 완전히 초기화
                                            })
                                        );
                                    }}
            ]);
        } else {
            console.error("❌ 사용자 정보 업데이트 실패:", result.message);
            Alert.alert("오류", "정보 수정에 실패했습니다.");
        }
    } catch (error) {
        console.error("❌ 사용자 정보 업데이트 중 오류 발생:", error);
        Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    }
    };

    

    return (
        <View style={styles.container}>
            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity 
                    onPress={() => {
                        if (navigation.canGoBack()) {
                             navigation.goBack();  // ✅ 이전 화면이 있으면 뒤로 가기
                        } else {
                            navigation.navigate("Login");  // ✅ 이전 화면이 없으면 Login 화면으로 이동
                        }
                    }} 
                    style={styles.backButton}
                >
                <Feather name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>

            {/* 질문 및 입력 UI */}
            <View style={styles.content}>
                <Text style={styles.question}>일주일에 평균 술을 몇 회 드시나요?</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={7}
                    step={1}
                    value={alcohol}
                    onSlidingComplete={(value) => setAlcohol(value)}
                    minimumTrackTintColor="#FBAF8B"
                    thumbTintColor="#FBAF8B"
                />
                <Text style={styles.sliderValue}>{alcohol}회</Text>

                <Text style={styles.question}>흡연자이신가요?</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.optionButton, smoking === 'yes' && styles.selected]}
                        onPress={() => setSmoking('yes')}
                    >
                        <Text style={[styles.optionText, smoking === 'yes' && styles.selectedText]}>예</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.optionButton, smoking === 'no' && styles.selected]}
                        onPress={() => setSmoking('no')}
                    >
                        <Text style={[styles.optionText, smoking === 'no' && styles.selectedText]}>아니요</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.question}>현재 임신 중이신가요?</Text>
                <View style={styles.gridContainer}>
                    {['해당사항 없음', '6개월 내에 계획 있음', '수유 중', '임신 중', '폐경기'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.optionBox, pregnancy === option && styles.selected]}
                            onPress={() => setPregnancy(option)}
                        >
                            <Text style={[styles.optionText, pregnancy === option && styles.selectedText]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 오류 메시지 출력 */}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>

            {/* 하단 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={updateUserInfo}>
                <Text style={styles.confirmText}>정보 수정 완료하기</Text>
            </TouchableOpacity>
        </View>
    );
};

// ✅ 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    backButton: {
        position: 'absolute',
        top: 43,
        left: 10,
        zIndex: 10,
        padding: 10,
    },
    backText: {
        fontSize: 24,
        color: 'black',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -30,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderValue: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
    },
    optionButton: {
        width: '45%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#666',
    },
    selected: {
        backgroundColor: '#FBAF8B',
        borderColor: '#FBAF8B',
    },
    selectedText: {
        color: 'white',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionBox: {
        width: '48%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'stretch',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
});

export default AlcoholSmoking;
