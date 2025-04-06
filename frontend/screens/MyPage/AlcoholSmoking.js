//AlcoholSmoking.js

import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, Alert, response } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from "react-native-vector-icons/Feather";

const AlcoholSmoking = () => {
    const navigation = useNavigation();

    

    // ✅ 상태 관리 (사용자 입력)
    const [exercise, setExercise] = useState(0); // 운동 횟수
    const [pregnancy, setPregnancy] = useState(null); // 임신 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지
    const [subPregnancy, setSubPregnancy] = useState(null);
    const [pregnancyWeek, setPregnancyWeek] = useState('');
    const [nausea, setNausea] = useState(0);

    



    // ✅ MongoDB에 정보 업데이트하는 함수
    const updateUserInfo = async () => {
        

        if (pregnancy === null) {
            setErrorMessage('모든 질문에 답해주세요.');
            return;
        }

        // 만약 '임신 중'이면 추가 체크
        if (pregnancy === '임신 중') {
            if (subPregnancy === null || pregnancyWeek.trim() === '') {
                setErrorMessage('임신 단계와 주차를 모두 입력해주세요.');
                return;
            }
        }


        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("오류", "로그인이 필요합니다.");
                return;
            }

        


            const updateData = {
                exercise,
                pregnancy
            };
            if (pregnancy === '임신 중') {
                updateData.subPregnancy = subPregnancy;
                updateData.pregnancyWeek = parseInt(pregnancyWeek);
                updateData.nausea = nausea;
            }
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
            await AsyncStorage.setItem("user_alcohol", String(exercise));
            await AsyncStorage.setItem("user_pregnancy", pregnancy);
            if (pregnancy === "임신 중") {
                await AsyncStorage.setItem("user_subPregnancy", subPregnancy);
                await AsyncStorage.setItem("user_pregnancyWeek", pregnancyWeek);
                await AsyncStorage.setItem("user_nausea", String(nausea));
            }
            // ✅ 성공 메시지 표시 후 MyPage로 이동
            Alert.alert("완료", "정보가 수정되었습니다.\n수정된 정보를 기반으로 홈이 갱신됩니다.", [
                { 
                  text: "확인", 
                  onPress: () => {
                    navigation.navigate("MyPageScreen");
                  }
                }
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
                <Feather name="chevron-left" size={40} color="gray" />
            </TouchableOpacity>

            {/* 질문 및 입력 UI */}
            {/* ✅ 스크롤 뷰 */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={{ height: 40 }} /> 
            <Text style={styles.question}>일주일에 운동을 평균 몇 회 하시나요?</Text>
            <Slider
                style={{ width: '96%', alignSelf: 'center', height: 40 }}
                minimumValue={0}
                maximumValue={7}
                step={1}
                value={exercise}
                onSlidingComplete={(value) => setExercise(value)}
                minimumTrackTintColor="#FBAF8B"
                thumbTintColor="#FBAF8B"
            />
            <View style={styles.tickContainer2}>
                {['0회', '1회', '2회', '3회', '4회', '5회','6회',, '7회'].map((label, i) => (
                    <View key={i} style={styles.tickWrapper}>
                        <View style={styles.tick} />
                        <Text style={styles.tickLabel}>{label}</Text>
                    </View>
                ))}
            </View>
            

                


                <Text style={styles.subQuestion1}>현재 임신 중이신가요?</Text>
                <View style={styles.gridContainer}>
                    {['6개월 내에 계획 있음', '수유 중', '임신 중'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.optionBox, pregnancy === option && styles.selected]}
                            onPress={() => setPregnancy(option)}
                        >
                            <Text style={[styles.optionText, pregnancy === option && styles.selectedText]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {pregnancy === '임신 중' && (
    <>
        {/* 임신 단계 질문 */}
        <View style={styles.subOptionContainer}>
            {['임신초기(~14주)', '임신중기(15~28주)', '임신후기(29주~)'].map((option) => (
                <TouchableOpacity
                    key={option}
                    style={[styles.subOption, subPregnancy === option && styles.selected]}
                    onPress={() => setSubPregnancy(option)}
                >
                    <Text style={[styles.optionText, subPregnancy === option && styles.selectedText]}>
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* 임신 주차 입력 */}
<Text style={styles.subQuestion}>임신 주차를 입력해주세요</Text>
<View style={styles.inputContainer}>
    <View style={styles.weekBoxLeft}>
        <Text style={styles.weekBoxText}>임신</Text>
    </View>

    <TextInput
        style={styles.weekInput}
        placeholder="0"
        placeholderTextColor="#999"
        keyboardType="numeric"
        maxLength={2}
        value={pregnancyWeek}
        onChangeText={setPregnancyWeek}
    />

    <View style={styles.weekBoxRight}>
        <Text style={styles.weekBoxText}>주차</Text>
    </View>
</View>



        {/* 입덧 질문 */}
        <Text style={styles.subQuestion}>입덧이 심하신가요?</Text>
        <Slider
            style={{ width: '96%', alignSelf: 'center', height: 40 }}
            minimumValue={0}
            maximumValue={4}
            step={1}
            value={nausea}
            onSlidingComplete={(value) => setNausea(value)}
            minimumTrackTintColor="#FBAF8B"
            thumbTintColor="#FBAF8B"
        />
        {/* 눈금 */}
        <View style={styles.tickContainer}>
            {['없음', '조금 있음','보통', '심함','매우심함'].map((label, i) => (
                <View key={i} style={styles.tickWrapper}>
                    <View style={styles.tick} />
                    <Text style={styles.tickLabel}>{label}</Text>
                </View>
            ))}
        </View>
    </>
)}


                {/* 오류 메시지 출력 */}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </ScrollView>

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
        top: 20,
        left: 5,
        zIndex: 10,
        padding: 10,
    },
    backText: {
        fontSize: 24,
        color: 'black',
    },
    content: {
        flex: 1,
        marginTop: -30,
    },
    scrollContent: {
        paddingBottom: 100, // 하단 confirm 버튼 안 겹치게
        paddingTop: 30,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderValue: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 5,
        marginBottom:30,
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
        flexDirection: 'column',
        alignItems: 'center',
    },
    optionBox: {
        width: '95%',
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
        fontSize: 18,
        fontWeight: 'bold',
        
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    subQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subQuestion1: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 10,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    subOptionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    
    subOption: {
        width: '49%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    
    tickContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        width: '108%',                    
        alignSelf: 'center',             
        
    },
    tickContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        width: '98%',                    
        alignSelf: 'center',             
        
    },
    
    tickWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    
    tick: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#999',
        marginBottom: 4,
    },
    
    tickLabel: {
        fontSize: 12,
        color: '#666',
    },
    scrollContent: {
        paddingBottom: 100, // 하단 confirm 버튼 안 겹치게
        paddingTop: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
        width: '95%',  // ✅ 추가
        alignSelf: 'center',  // ✅ 가운데 정렬 (버튼들과 맞춤)
    },
    weekBoxLeft: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9F7F4',
        borderRightWidth: 1,
        borderColor: '#ddd',
    },
    weekBoxRight: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9F7F4',
        borderLeftWidth: 1,
        borderColor: '#ddd',
    },
    weekBoxText: {
        fontSize: 16,
        color: '#333',
    },
    weekInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
    },
});

export default AlcoholSmoking;
