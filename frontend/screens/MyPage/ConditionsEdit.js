//ConditionsEdit.js


import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from "react-native-vector-icons/Feather";




const ConditionsEdit = () => {
    const navigation = useNavigation();

    // ✅ 상태 관리
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가

    // ✅ 질환 목록
    const conditions = [
        '해당 사항이 없어요', '고혈압', '당뇨병', '간질환', '지방간',
        '고지혈증(콜레스테롤)', '고중성지방혈증', '위장질환', '대장질환', '변비',
        '빈혈', '골다공증', '관절염', '다낭성난소증후군', '비만',
        '비타민D 부족', '우울증', '불면증', '비염', '백반증',
        '건선', '습진', '여드름', '아토피 피부염', '폐질환',
        '뇌전증', '백내장', '녹내장'
    ];

    // ✅ 선택 토글 함수 (선택 시 에러 메시지 제거)
    const toggleCondition = (condition) => {
        setErrorMessage(''); // 항목 선택 시 에러 메시지 초기화

        if (condition === '해당 사항이 없어요') {
            setSelectedConditions(['해당 사항이 없어요']);
        } else {
            setSelectedConditions((prev) => {
                if (prev.includes('해당 사항이 없어요')) {
                    return [condition];
                }
                return prev.includes(condition)
                    ? prev.filter(item => item !== condition)
                    : [...prev, condition];
            });
        }
    };

    
    const handleNext = async () => {
        if (selectedConditions.length === 0) {
            setErrorMessage('질문에 답해주세요.');
            return;
        }
    
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("오류", "로그인이 필요합니다.");
                return;
            }
    
            // MongoDB 업데이트 요청
            const response = await fetch("http://10.0.2.2:5001/update-conditions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ conditions: selectedConditions }),
            });
    
            const result = await response.json();
            console.log("🟢 서버 응답:", result);
    
            if (result.status === "ok") {
                console.log("✅ 만성질환 정보 업데이트 성공!");
                await AsyncStorage.setItem("user_conditions", JSON.stringify(selectedConditions));
    
                // ✅ 성공 메시지 표시 후 MyPage로 이동
                Alert.alert("완료", "정보가 수정되었습니다.", [
                                    { 
                                      text: "확인", 
                                      onPress: () => {
                                        navigation.navigate("MainTabs", { screen: "MyPage" }); // ✅ 정확한 경로로 이동
                                      }
                                    }
                                  ]);
            } else {
                console.error("❌ 만성질환 정보 업데이트 실패:", result.message);
                Alert.alert("오류", "정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("❌ 만성질환 정보 업데이트 중 오류 발생:", error);
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
                    style={styles.backButton}>
                    <Feather name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>






            <Text style={styles.title}>갖고 있는 질환이 있으신가요?</Text>
            <Text style={styles.subtitle}>피해야 하는 영양성분을 분석해드릴게요</Text>

            <ScrollView contentContainerStyle={styles.conditionContainer}>
                {conditions.map((condition, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.conditionButton,
                            selectedConditions.includes(condition) && styles.selectedButton
                        ]}
                        onPress={() => toggleCondition(condition)}>
                        <Text
                            style={[
                                styles.conditionText,
                                selectedConditions.includes(condition) && styles.selectedText
                            ]}>
                            {condition}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 에러 메시지 표시 */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* 확인 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 110,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    conditionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    conditionButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 5,
    },
    conditionText: {
        fontSize: 14,
        color: '#666',
    },
    selectedButton: {
        backgroundColor: '#FBAF8B',
        borderColor: '#FBAF8B',
    },
    selectedText: {
        color: 'white',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    confirmButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 10,
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConditionsEdit;
