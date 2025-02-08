import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignupScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // ✅ "다음" 버튼을 눌렀을 때 UserInfoScreen으로 이동
    const handleNext = () => {
        navigation.navigate('UserInfo'); 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ✅ 완전히 왼쪽 상단에 배치된 뒤로가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.title}>회원 가입</Text>
                <Text style={styles.subtitle}>e-mail 주소로 가입하기</Text>

                <TextInput
                    style={styles.input}
                    placeholder="이메일 주소 입력"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 입력"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {/* ✅ "다음" 버튼 클릭 시 UserInfoScreen으로 이동 */}
                <TouchableOpacity style={styles.signupButton} onPress={handleNext}>
                    <Text style={styles.signupText}>다음</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },

    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        padding: 10,
    },

    backText: {
        fontSize: 20,
        color: '#333',
    },

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },

    signupButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },

    signupText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SignupScreen;
