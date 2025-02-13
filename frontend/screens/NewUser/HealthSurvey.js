import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthSurvey = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 값 (초기값: 0 → 목표값: 33, useRef 사용으로 고정)
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 33, // 목표값 (33%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false, // width 속성에는 useNativeDriver 사용 불가
        }).start();
    }, []); // ✅ 한 번만 실행됨

    // ✅ 상태 관리 (사용자 입력)
    const [alcohol, setAlcohol] = useState(0); // 음주 횟수
    const [smoking, setSmoking] = useState(null); // 흡연 여부
    const [pregnancy, setPregnancy] = useState(null); // 임신 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지

    // ✅ 데이터 저장 및 다음 화면 이동 (HealthSurvey2로)
    const handleConfirm = async () => {
        if (smoking === null || pregnancy === null) {
            setErrorMessage('모든 질문에 답해주세요.');
            return;
        }
    
        try {
            await AsyncStorage.setItem("user_alcohol", String(alcohol));
            await AsyncStorage.setItem("user_smoking", smoking);
            await AsyncStorage.setItem("user_pregnancy", pregnancy);
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
                    inputRange: [0, 33],
                    outputRange: ['0%', '33%'],
                }) }]} />
            </View>

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
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
        backgroundColor: 'white',
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
});

export default HealthSurvey;
