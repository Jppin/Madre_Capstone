//HealthSurvey3.js

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
            toValue: 70, // 목표값 (100%)
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
        "임신성 당뇨", "임신성 고혈압", "임신 중독증", "피로감/에너지 부족", "변비/소화불량", "임신성 빈혈", "체중 증가 관리",
        "요통/골반통", "스트레스/정서 안정", "산후 우울증", "수면장애/불면증", "면역력 강화", "갑상선 기능 저하",
        "부종/혈액순환 장애"
    ];

    const fetalConcerns = [
        "태아 두뇌 발달 지원", "태아 뼈 형성 지원", "조산 예방/자궁 건강", "태아 성장 지연 예방"
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
    
            navigation.navigate('HealthSurvey4');
        } catch (error) {
            console.error("❌ HealthSurvey3 데이터 저장 실패:", error);
        }    
        
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
                    inputRange: [40, 70],
                    outputRange: ['40%', '70%'],
                }) }]} />
            </View>

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            {/* 질문 텍스트 */}
            <Text style={styles.title}>{"주요 건강 고민이 무엇인가요?"}</Text>
            <Text style={styles.sulmeyong}>{"(중복 선택 가능, 최소 1개 이상 선택해주세요.)"}</Text>
            <View style={styles.subtitleWrapper}>
            <View style={styles.dot} />
            <Text style={styles.subtitle}>산모 건강 위험 관리</Text>
            <View style={styles.dot} />
            </View>
            
            
            <ScrollView contentContainerStyle={styles.concernContainer}
            showsVerticalScrollIndicator={false}>
                
                
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








            <View style={styles.subtitleWrapper}>
            <View style={styles.dot} />
            <Text style={styles.subtitle}>태아 건강 지원</Text>
            <View style={styles.dot} />
            </View>

            <View style={styles.concernContainer2}>
            {fetalConcerns.map((concern, index) => (
            <TouchableOpacity
                key={`fetal-${index}`}
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
            </View>
            </ScrollView>

            {/* 에러 메시지 */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* 다음 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
                <Text style={styles.confirmText}>다음</Text>
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
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 25,
        marginBottom: 15,
    },
    concernContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    concernContainer2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        
    },
    concernButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 3,
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
    subtitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FBAF8B',
        marginHorizontal: 8,
      },
      
});

export default HealthSurvey3;
