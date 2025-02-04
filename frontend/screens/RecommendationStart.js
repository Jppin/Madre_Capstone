import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RecommendationStart = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Image source={require('../assets/icons/capybara1.png')} style={styles.image} />
            <View style={styles.separator} />
            <Text style={styles.title}>당신에게 꼭 맞는 영양성분을{'\n'}추천해드릴게요.</Text>
            <Text style={styles.subtitle}>
                몇 가지 건강 정보를 입력하면{'\n'}더 정확한 추천을 받을 수 있어요.
            </Text>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HealthSurvey')}>
                <Text style={styles.buttonText}>내 맞춤 추천 시작하기</Text>
            </TouchableOpacity>
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
    image: {
        width: 150,
        height: 230,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
        color: '#666'
    },
    subtitle: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    separator: {
        width: '85%',
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 20,
        
    },
    button: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000', // ✅ 그림자 추가
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RecommendationStart;
