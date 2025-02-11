import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

const SignupScreen = ({ props }) => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [emailVerify, setEmailVerify] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordVerify, setConfirmPasswordVerify] = useState(false);
    

    // ✅ "다음" 버튼을 눌렀을 때 UserInfoScreen으로 이동
    const handleNext = () => {
        if (emailVerify && passwordVerify && confirmPasswordVerify) {
            navigation.navigate('UserInfo'); 
        }
    };

    function handleEmail(e) {
        const emailVar = e.nativeEvent.text;
        setEmail(emailVar);
        setEmailVerify(false);
        if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(emailVar)) {
            setEmailVerify(true);
        }
    }

    function handlePassword(e) {
        const passwordVar = e.nativeEvent.text;
        setPassword(passwordVar);
        setPasswordVerify(false);
    
        // ✅ 최소 10자 이상, 소문자 1개 이상, 숫자 1개 이상, 특수문자 1개 이상
        if (/^(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{10,}$/.test(passwordVar)) {
            setPasswordVerify(true);
        }
    }
    

    // ✅ 비밀번호 확인 필드 검증 추가
    function handleConfirmPassword(e) {
        const confirmPasswordVar = e.nativeEvent.text;
        setConfirmPassword(confirmPasswordVar);
        setConfirmPasswordVerify(false);
        
        if (confirmPasswordVar === password && confirmPasswordVar.length > 0) {
            setConfirmPasswordVerify(true);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Feather name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>
            <View style={styles.container}>
                <Text style={styles.title}>회원 가입</Text>
                <Text style={styles.subtitle}>e-mail 주소로 가입하기</Text>

                <TextInput
                    style={styles.input}
                    placeholder="이메일 주소 입력"
                    value={email}
                    onChange={handleEmail}
                />
                { email.length < 1 ? null : !emailVerify && (
                    <Text style={styles.errorText}>
                        올바른 형식의 주소를 입력하세요.
                    </Text>
                )}

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={handlePassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Feather name={showPassword ? "eye" : "eye-off"} color={'grey'} size={23} />
                    </TouchableOpacity>
                </View>

                { password.length < 1 ? null : !passwordVerify && (
                    <Text style={styles.errorText}>
                        알파벳 소문자, 숫자, 특수문자가 포함된 10자 이상의 비밀번호를 입력하세요.
                    </Text>
                )}

                {/* ✅ 비밀번호 확인 필드 추가 */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    secureTextEntry
                    value={confirmPassword}
                    onChange={handleConfirmPassword}
                />
                { confirmPassword.length < 1 ? null : !confirmPasswordVerify && (
                    <Text style={styles.errorText}>
                        비밀번호가 일치하지 않습니다.
                    </Text>
                )}

                <TouchableOpacity 
                    style={[styles.signupButton, (!emailVerify || !passwordVerify || !confirmPasswordVerify) && styles.disabledButton]} 
                    onPress={handleNext}
                    disabled={!emailVerify || !passwordVerify || !confirmPasswordVerify}
                >
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
        top: 15,
        left: 15,
        zIndex: 10,
        padding: 5,
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

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',  // 전체 너비 차지하도록 설정
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    
    passwordInput: {
        flex: 1, // 입력 필드가 남은 공간을 다 차지하도록 설정
        height: 50,
    },
    
    eyeIcon: {
        padding: 10, // 터치 영역 확보
    },
    
    errorText: {
        marginBottom: 10,
        color: 'red',
        textAlign: 'left', // ✅ 왼쪽 정렬
        alignSelf: 'flex-start', // ✅ 부모 컨테이너 기준 왼쪽 정렬
        marginLeft: 10, // ✅ 약간의 왼쪽 여백 추가 (선택 사항)
    },

    signupButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },

    disabledButton: {
        backgroundColor: '#ccc',
    },

    signupText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SignupScreen;
