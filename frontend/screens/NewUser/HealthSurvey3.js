import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../components/LoadingScreen'; // ✅ 로딩 스크린 추가
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthSurvey3 = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 (초기값 66 → 목표값 100)
    const progress = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 60, // 목표값 (100%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false,
        }).start();
    }, []);

    // ✅ 상태 관리
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가

    // ✅ 건강 고민 목록
    const healthConcerns = [
        "눈 건강", "체지방 개선", "피부 건강", "모발 & 손톱 건강", "피로감", "스트레스/수면", "소화 & 장 건강",
        "면역 기능", "운동능력/근육량", "여성건강", "갱년기 여성건강", "비뇨기 건강", "전립선 건강",
        "노화/항산화", "치아/잇몸 건강", "심혈관 건강", "기억력 개선", 
        "뼈 건강", "관절 건강", "간 건강", "갑상선 건강", "혈중 중성지방"
    ];

    // ✅ 선택 토글 함수
    const toggleConcern = (concern) => {
        setErrorMessage('');

        setSelectedConcerns((prev) =>
            prev.includes(concern)
                ? prev.filter(item => item !== concern)
                : [...prev, concern]
        );
    };

    // ✅ 확인 버튼 클릭 시 처리
    const handleNext = async () => {
        if (selectedConcerns.length === 0) {
            setErrorMessage('고민되는 건강 항목을 선택해주세요.');
            return;
        }
    
        try {
            await AsyncStorage.setItem("user_concerns", JSON.stringify(selectedConcerns));
            console.log("✅ HealthSurvey3 데이터 저장 완료!");
    
            navigation.navigate('InfoComplete');
        } catch (error) {
            console.error("❌ HealthSurvey3 데이터 저장 실패:", error);
        }    

        // ✅ 2초 후에 로딩 스크린에서 InfoComplete로 이동
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('InfoComplete', { selectedConcerns });
        }, 2000);
    };

    // ✅ 로딩 중이면 로딩 화면 표시
    if (isLoading) {
        return <LoadingScreen />;
    }

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

            {/* 질문 텍스트 */}
            <Text style={styles.title}>{"주요 건강 고민이 무엇인가요?"}</Text>
            <Text style={styles.sulmeyong}>{"(중복 선택 가능)"}</Text>

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

            {/* 에러 메시지 */}
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
        justifyContent: 'space-between',
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginTop: 50,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FBAF8B',
        borderRadius: 4,
    },
    backButton: {
        position: 'absolute',
        top: 50,
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
        marginTop: 50,
        marginBottom: 5,
    },
    sulmeyong: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        color : 'grey',
        marginBottom: 20,
    },
    concernContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 30,
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
        marginTop: 20,
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HealthSurvey3;
