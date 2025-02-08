//HealthSurvey3.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HealthSurvey3 = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 (초기값 66 → 목표값 100)
    const progress = useRef(new Animated.Value(66)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 100, // 목표값 (100%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false,
        }).start();
    }, []);

    // ✅ 상태 관리
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지

    // ✅ 건강 고민 목록
    const healthConcerns = [
        "눈 건강", "체지방 개선", "피부건강", "피로감", "장 건강", "스트레스/수면",
        "면역 기능", "운동능력/근육량", "소화 기능", "여성건강", "갱년기 여성건강", "전립선 건강",
        "비뇨기능 개선", "노화/항산화", "치아/잇몸", "콜레스테롤 개선", "기억력 개선", "탈모/손톱건강",
        "혈압 조절", "뼈 건강", "관절 건강", "간 건강", "갑상선 건강", "혈중 중성지방"
    ];

    // ✅ 선택 토글 함수 (선택 시 색상 변경, 선택하면 에러 메시지 제거)
    const toggleConcern = (concern) => {
        setErrorMessage(''); // 선택하면 에러 메시지 제거

        setSelectedConcerns((prev) =>
            prev.includes(concern)
                ? prev.filter(item => item !== concern) // 이미 선택된 경우 해제
                : [...prev, concern] // 새로 선택
        );
    };

    // ✅ 확인 버튼 클릭 시 검사 후 이동
    const handleNext = () => {
        if (selectedConcerns.length === 0) {
            setErrorMessage('고민되는 건강 항목을 선택해주세요.');
            return;
        }
        console.log("선택된 건강 고민:", selectedConcerns);
        navigation.navigate('NextScreen', { selectedConcerns });
    };

    return (
        <View style={styles.container}>
            {/* 상단 진행 바 */}
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progress.interpolate({
                    inputRange: [66, 100],
                    outputRange: ['66%', '100%'],
                }) }]} />
            </View>

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            {/* 질문 텍스트 (줄바꿈 포함) */}
            <Text style={styles.title}>{"고민되거나 개선하고 싶은\n건강 고민이 있으신가요?"}</Text>

            <ScrollView contentContainerStyle={styles.concernContainer}>
                {healthConcerns.map((concern, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.concernButton,
                            selectedConcerns.includes(concern) && styles.selectedButton
                        ]}
                        onPress={() => toggleConcern(concern)}
                    >
                        <Text
                            style={[
                                styles.concernText,
                                selectedConcerns.includes(concern) && styles.selectedText
                            ]}
                        >
                            {concern}
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
        justifyContent: 'space-between', // 전체 배치 조정
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginTop: 50, // ✅ 진행 바 위치 조정
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FBAF8B',
        borderRadius: 4,
    },
    backButton: {
        position: 'absolute',
        top: 50, // ✅ 버튼을 더 아래로 내림
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
        marginTop: 50, // ✅ 질문을 아래로 내림
        marginBottom: 20,
    },
    concernContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 30, // ✅ 스크롤뷰 패딩 추가 (버튼과 겹치지 않게)
    },
    concernButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 2,
    },
    concernText: {
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
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 10,
    },
    confirmButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 20, // ✅ 버튼을 더 아래로 내림
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HealthSurvey3;
