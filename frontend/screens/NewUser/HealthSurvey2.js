import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthSurvey2 = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 값 (초기값: 33 → 목표값: 66, useRef 사용)
    const progress = useRef(new Animated.Value(33)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 66, // 목표값 (66%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false,
        }).start();
    }, []);

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
        '뇌전증', '백내장', '녹내장', '갑상선 기능 저하증'
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

    // ✅ 확인 버튼 클릭 시, 선택 여부 검사 → HealthSurvey3으로 이동
    const handleNext = async () => {
        if (selectedConditions.length === 0) {
            setErrorMessage('질문에 답해주세요.');
            return;
        }
    
        try {
            await AsyncStorage.setItem("user_conditions", JSON.stringify(selectedConditions));
            console.log("✅ HealthSurvey2 데이터 저장 완료!");
    
            navigation.navigate('HealthSurvey3');
        } catch (error) {
            console.error("❌ HealthSurvey2 데이터 저장 실패:", error);
        }
    };
    

    return (
        <View style={styles.container}>
            {/* 상단 진행 바 */}
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progress.interpolate({
                    inputRange: [33, 66],
                    outputRange: ['33%', '66%'],
                }) }]} />
            </View>

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
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
                        onPress={() => toggleCondition(condition)}
                    >
                        <Text
                            style={[
                                styles.conditionText,
                                selectedConditions.includes(condition) && styles.selectedText
                            ]}
                        >
                            {condition}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 에러 메시지 표시 */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* 확인 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HealthSurvey2;
