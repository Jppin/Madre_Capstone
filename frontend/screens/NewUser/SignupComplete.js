import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupComplete = () => {
    const navigation = useNavigation();
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedNickname = await AsyncStorage.getItem("user_nickname");
                setNickname(storedNickname || "사용자");
            } catch (error) {
                console.error("닉네임 불러오기 오류:", error);
                setNickname("사용자"); // 에러 발생 시 기본값 설정
            }
        };

        fetchUserData();

        const timer = setTimeout(() => {
            navigation.replace('RecommendationStart'); // 2초 후 추천 시작 페이지로 이동
        }, 2000);

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>환영합니다 {nickname}님!</Text>
            <Text style={styles.completeText}>가입이 완료되었어요</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F7F4',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FBAF8B',
    },
    completeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
});

export default SignupComplete;
