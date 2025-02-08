import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomSpinner from '../components/CustomSpinner'; // ✅ 커스텀 스피너 사용

const LoadingScreen = ({ message = "정보를 처리 중입니다.", subMessage = "잠시만 기다려주세요." }) => {
    return (
        <View style={styles.container}>
            {/* 카피바라 이미지 */}
            <Image source={require('../assets/icons/capybara2.png')} style={styles.image} />
            
            {/* 메시지 박스 */}
            <View style={styles.box}>
                <Text style={styles.text}>{message}</Text>
                <Text style={styles.subText}>{subMessage}</Text>
                
                {/* 로딩 스피너 */}
                <CustomSpinner />
            </View>

           
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    image: {
        width: 120, // ✅ 이미지 크기 조정
        height: 160,
        marginBottom: 20,
    },
    box: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // ✅ 반투명 효과
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
       // ✅ 안드로이드 그림자
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
    },
    startButton: {
        backgroundColor: '#FBAF8B',
        paddingVertical: 15,
        width: '90%',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    startText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoadingScreen;