//LoginScreen.js

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from "../context/AuthContext";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';
import createAPI from '../api';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { isNewUser, loading, getData } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    

    // ✅ 로그인 버튼 (토큰 저장 후 Main으로 이동)
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("입력 확인", "이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }
    
        const userData = { email, password };
        const api = await createAPI();
    
        try {
            const res = await api.post("/login-user", userData);
    
            if (res.data.status === "ok" && res.data.token) {
                await AsyncStorage.setItem("token", res.data.token);
    
                // ✅ getData() 실행하여 `isNewUser` 상태 업데이트
                await getData();
    
                // ✅ isNewUser 상태 확인 후 이동
                setTimeout(() => {
                    if (isNewUser) {
                        console.log("✅ 신규 유저 감지됨 → UserInfoScreen으로 이동");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Auth", params: { initialRoute: "UserInfo" } }], // ✅ AuthNavigator에서 UserInfo로 초기화
                        });
                    } else {
                        console.log("✅ 기존 유저 → MainNavigator로 이동");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "MainNavigator" }],
                        });
                    }
                }, 500); // UI 업데이트 기다리는 작은 지연 추가
    
            } else {
                Alert.alert("로그인 실패", res.data.message || "아이디 또는 비밀번호를 확인하세요.");
            }
        } catch (error) {
            console.log("❌ Login error 발생!");
            console.log("📛 error.message:", error.message);
            console.log("📦 error.response:", error.response);
            console.log("📨 error.request:", error.request);
            console.log("🔥 전체 error:", error);
            Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
        }
        
    };
    
    
    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };


    // ✅ "회원가입" 버튼 클릭 시 회원가입 페이지로 이동
    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* ✅ 로고 */}
                <Image 
                    source={require('../assets/icons/logo3.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                 <Image 
                    source={require('../assets/icons/logotext.png')} 
                    style={styles.logoText} 
                    resizeMode="contain" 
                />

                {/* ✅ 이메일 로그인 입력 필드 */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>e-mail 주소로 로그인</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="이메일 주소 입력" 
                        value={email} 
                        onChangeText={(text) => setEmail(text)}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput 
                            style={styles.passwordInput} 
                            placeholder="비밀번호 입력"  
                            secureTextEntry={!showPassword} 
                            value={password} 
                            onChangeText={(text) => setPassword(text)}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Feather name={showPassword ? "eye" : "eye-off"} color={"grey"} size={23} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>로그인</Text>
                </TouchableOpacity>

                <View style={styles.linkContainer}>
                    <TouchableOpacity onPress={handleForgotPassword}><Text style={styles.linkText}>비밀번호를 잊어버렸나요?</Text></TouchableOpacity>
                    <Text style={styles.divider}> | </Text>
                    
                    <TouchableOpacity onPress={handleSignup}>
                        <Text style={styles.linkText}>회원가입하기</Text>
                    </TouchableOpacity>
                </View>

                {/* ✅ SNS 로그인 버튼 
                <View style={styles.snsContainer}>
                    <TouchableOpacity style={styles.snsButton}>
                        <Image source={require('../assets/icons/google.png')} style={styles.snsIcon} />
                        <Text style={styles.snsText}>구글로 로그인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.snsButton}>
                        <Image source={require('../assets/icons/naver.png')} style={styles.snsIcon} />
                        <Text style={styles.snsText}>네이버로 로그인</Text>
                    </TouchableOpacity>
                </View>*/}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F7F4',
    },

    container: { 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logo: { 
        width: 300,
        height: 240,
        marginBottom : -80
        
    },
    logoText : { 
        width: 210,
        height: 160,
        marginBottom: -30,

    },

    inputContainer: {
        width: '80%',
        alignItems: 'flex-start',
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    passwordInput: {
        flex: 1,
        height: 50,
    },

    eyeIcon: {
        padding: 10,
    },

    label: { 
        fontSize: 16, 
        color: '#888', 
        marginBottom: 10,
        textAlign: 'left',
    },

    input: { 
        width: '100%', 
        height: 50, 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        marginBottom: 10, 
        paddingHorizontal: 10 
    },

    loginButton: { 
        backgroundColor: '#FBAF8B', 
        padding: 15, 
        borderRadius: 5, 
        width: '80%', 
        alignItems: 'center',
        marginTop: 10,
    },

    loginText: { color: 'white', fontSize: 16 },

    linkContainer: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom : 25,
    },

    linkText: {
        fontSize: 14,
        color: '#000000',
    },

    divider: {
        fontSize: 14,
        color: '#999',
        marginHorizontal: 5,
    },
    /*
    snsContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    
    snsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
    },

    snsIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        resizeMode: 'contain',
    },

    snsText: {
        fontSize: 14,
        color: '#333',
    },
    */
});

export default LoginScreen;
