import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

const HealthSurvey = ({ progress = 33 }) => {
    const navigation = useNavigation();

    // ✅ 상태 관리 (사용자 입력)
    const [alcohol, setAlcohol] = useState(0); // 음주 횟수
    const [smoking, setSmoking] = useState(null); // 흡연 여부
    const [pregnancy, setPregnancy] = useState(null); // 임신 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지

    // ✅ 데이터 저장 및 다음 화면 이동 (HealthSurvey2로)
    const handleConfirm = () => {
        if (smoking === null || pregnancy === null) {
            setErrorMessage('모든 질문에 답해주세요.');
            return;
        }

        const userData = { alcohol, smoking, pregnancy };
        console.log("저장된 데이터:", userData);
        navigation.navigate('HealthSurvey2', { userData });
    };

    return (
        <View style={styles.container}>
            {/* 상단 진행 바 */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
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
        marginTop: 40, // ✅ 진행 바 위치 조정
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FBAF8B',
        borderRadius: 4,
    },
    backButton: {
        position: 'absolute',
        top: 43, // ✅ 뒤로 가기 버튼 위치 조정
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
