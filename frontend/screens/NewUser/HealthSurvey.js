import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthSurvey = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 값 (초기값: 0 → 목표값: 25, useRef 사용으로 고정)
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 25, // 목표값 (25%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false, // width 속성에는 useNativeDriver 사용 불가
        }).start();
    }, []); // ✅ 한 번만 실행됨

    // ✅ 상태 관리 (사용자 입력)
    const [exercise, setExercise] = useState(0); // 운동 횟수
    const [pregnancy, setPregnancy] = useState(null); // 임신 상태
    const [subPregnancy, setSubPregnancy] = useState(null); // 임신 단계
    const [nausea, setNausea] = useState(0); // 입덧 정도
    const [pregnancyWeek, setPregnancyWeek] = useState(''); // 임신 주차 입력 값

    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지




    
    // ✅ 데이터 저장 및 다음 화면 이동 (HealthSurvey2로)
    const handleConfirm = async () => {
        // 공통 체크
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
    
        // 통과하면 저장
        try {
            await AsyncStorage.setItem("user_exercise", String(exercise));
            await AsyncStorage.setItem("user_pregnancy", pregnancy);
            
            if (pregnancy === "임신 중") {
                await AsyncStorage.setItem("user_subPregnancy", subPregnancy);
                await AsyncStorage.setItem("user_pregnancyWeek", pregnancyWeek);
                await AsyncStorage.setItem("user_nausea", String(nausea));
              }
            
            console.log("✅ HealthSurvey 데이터 저장 완료!");
    
            navigation.navigate('HealthSurvey2');
        } catch (error) {
            console.error("❌ HealthSurvey 데이터 저장 실패:", error);
        }
    };
    

    return (
        <View style={styles.container}>
            {/* 상단 진행 바 */}
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progress.interpolate({
                    inputRange: [0, 25],
                    outputRange: ['0%', '25%'],
                }) }]} />
            </View>

            {/* 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            {/* 질문 및 입력 UI */}
            {/* ✅ 스크롤 뷰 */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
        </View>
    );
};

// ✅ 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginTop: 40,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FBAF8B',
        borderRadius: 4,
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
        
        marginTop: -30,
    },
    question: {
        fontSize: 16,
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

export default HealthSurvey;
