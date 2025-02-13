//InfoComplete.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InfoComplete = ({ route }) => {
    const navigation = useNavigation();

    // ✅ 닉네임 (route.params에서 가져오기, 기본값 "사용자님")
    const nickname = route?.params?.nickname || "사용자님";

    // ✅ 시작하기 버튼 클릭 시 → HomeScreen으로 이동
    const handleStart = () => {
        navigation.replace("MainTabs");
    };

    return (
        <View style={styles.container}>
            {/* 상단 구분선 */}
            <View style={styles.line} />

            {/* 완료 메시지 */}
            <Text style={styles.title}>모든 정보 입력이 완료되었어요! 🎉</Text>
            <Text style={styles.subtitle}>
                이제 <Text style={styles.bold}>{nickname}</Text>의 첫 번째 맞춤형{"\n"}
                영양성분을 만나보세요!
            </Text>

            {/* 하단 구분선 */}
            <View style={styles.line} />

            {/* 시작하기 버튼 */}
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startText}>시작하기</Text>
            </TouchableOpacity>
        </View>
    );
};

// ✅ 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    line: {
        width: '80%',
        height: 1,
        backgroundColor: '#D9D9D9',
        marginVertical: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    bold: {
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#FBAF8B',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 8,
        position: 'absolute',
        bottom: 40,
    },
    startText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default InfoComplete;
