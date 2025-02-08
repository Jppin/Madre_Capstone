import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const SignupComplete = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { nickname, birthYear, selectedGender } = route.params;

    useEffect(() => {
        setTimeout(() => {
            navigation.replace('RecommendationStart'); // 2초 후 추천 시작 페이지로 이동
        }, 2000);
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
        backgroundColor: 'white',
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
