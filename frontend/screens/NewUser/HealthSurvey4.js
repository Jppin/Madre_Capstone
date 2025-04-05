//HealthSurvey4.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from '../../components/LoadingScreen'; // ✅ 로딩 스크린 추가
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthSurvey4 = () => {
    const navigation = useNavigation();

    // ✅ 진행 바 애니메이션 (초기값 66 → 목표값 100)
    const progress = useRef(new Animated.Value(75)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 100, // 목표값 (100%)
            duration: 500, // 애니메이션 지속 시간 (0.5초)
            useNativeDriver: false,
        }).start();
    }, []);

    // ✅ 상태 관리
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가

    // ✅ 건강 고민 목록
    const skinConcerns = [
        "기미/잡티/색소침착", "피부 트러블/여드름", "탈모/모발 건강", "손톱 강화"
    ];

    const lifestyleConcerns = [
        "눈 건강", "운동능력/근육량", "간 건강", "혈당 관리", "치아/잇몸", "노화/향산화", "기억력/인지력", "뼈 건강", "관절 건강"
    ];

    const otherConcerns = [
        "수유 준비", "수분 보충/탈수 예방", "출산 후 회복(산후 관리 준비)"
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
            // ✅ 기존 concerns 불러오기
            const prevConcerns = JSON.parse(await AsyncStorage.getItem("user_concerns")) || [];
    
            // ✅ 중복 제거 후 병합
            const mergedConcerns = Array.from(new Set([...prevConcerns, ...selectedConcerns]));
    
            await AsyncStorage.setItem("user_concerns", JSON.stringify(mergedConcerns));
            console.log("✅ HealthSurvey4까지 모든 concern 저장 완료!");
    
            navigation.navigate('InfoComplete');
        } catch (error) {
            console.error("❌ HealthSurvey4 데이터 저장 실패:", error);
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
                    inputRange: [75, 100],
                    outputRange: ['75%', '100%'],
                }) }]} />
            </View>

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={{ height: 15 }} />
            
            <View contentContainerStyle={styles.concernContainer} showsVerticalScrollIndicator={false}>
            
                {/* 피부/외형 변화 */}
                <View style={styles.subtitleWrapper}>
                    <View style={styles.dot} />
                    <Text style={styles.subtitle}>피부/외형 변화</Text>
                    <View style={styles.dot} />
                </View>
                <View style={styles.concernRow}>
                    {skinConcerns.map((concern, index) => (
                        <TouchableOpacity
                            key={`skin-${index}`}
                            style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                            onPress={() => toggleConcern(concern)}
                        >
                            <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                {concern}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 생활습관 & 웰빙 */}
                <View style={styles.subtitleWrapper}>
                    <View style={styles.dot} />
                    <Text style={styles.subtitle}>생활습관 & 웰빙</Text>
                    <View style={styles.dot} />
                </View>
                <View style={styles.concernRow}>
                    {lifestyleConcerns.map((concern, index) => (
                        <TouchableOpacity
                            key={`life-${index}`}
                            style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                            onPress={() => toggleConcern(concern)}
                        >
                            <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                {concern}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 기타 고민 */}
                <View style={styles.subtitleWrapper}>
                    <View style={styles.dot} />
                    <Text style={styles.subtitle}>기타 고민</Text>
                    <View style={styles.dot} />
                </View>
                <View style={styles.concernRow}>
                    {otherConcerns.map((concern, index) => (
                        <TouchableOpacity
                            key={`other-${index}`}
                            style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                            onPress={() => toggleConcern(concern)}
                        >
                            <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                {concern}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>


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
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
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
    concernRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
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

export default HealthSurvey4;
