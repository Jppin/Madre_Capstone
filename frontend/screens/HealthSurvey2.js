//HealthSurvey2.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HealthSurvey2 = () => {
    const navigation = useNavigation();

    // ✅ 질환 선택 데이터 (사용자가 선택한 질환 목록)
    const [selectedConditions, setSelectedConditions] = useState([]);

    // ✅ 질환 목록 (사진 참고)
    const conditions = [
        '해당 사항이 없어요', '고혈압', '당뇨병', '간질환', '지방간',
        '고지혈증(콜레스테롤)', '고중성지방혈증', '위장질환', '대장질환', '변비',
        '빈혈', '골다공증', '관절염', '다낭성난소증후군', '비만',
        '비타민D 부족', '우울증', '불면증', '비염', '백반증',
        '건선', '습진', '여드름', '아토피 피부염', '폐질환',
        '뇌전증', '백내장', '녹내장'
    ];

    // ✅ 선택 토글 함수
    const toggleCondition = (condition) => {
        if (selectedConditions.includes(condition)) {
            setSelectedConditions(selectedConditions.filter(item => item !== condition));
        } else {
            setSelectedConditions([...selectedConditions, condition]);
        }
    };

    // ✅ 확인 버튼 클릭 → HealthSurvey3으로 이동 (입력 데이터 함께 전달)
    const handleNext = () => {
        console.log("선택된 질환 목록:", selectedConditions);
        navigation.navigate('HealthSurvey3', { selectedConditions });
    };

    return (
        <View style={styles.container}>
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
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
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
    confirmButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HealthSurvey2;
