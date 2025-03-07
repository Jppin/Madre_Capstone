import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const SignupScreen = () => {
    const navigation = useNavigation();
    const { getData } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [emailVerify, setEmailVerify] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordVerify, setPasswordVerify] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordVerify, setConfirmPasswordVerify] = useState(false);

    // ✅ 이메일 검증
    function handleEmail(e) {
        const emailVar = e.nativeEvent.text;
        setEmail(emailVar);
        setEmailVerify(/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(emailVar));
    }

    // ✅ 비밀번호 검증
    function handlePassword(e) {
        const passwordVar = e.nativeEvent.text;
        setPassword(passwordVar);
        setPasswordVerify(/^(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{10,}$/.test(passwordVar));
    }

    // ✅ 비밀번호 확인 검증
    function handleConfirmPassword(e) {
        const confirmPasswordVar = e.nativeEvent.text;
        setConfirmPassword(confirmPasswordVar);
        setConfirmPasswordVerify(confirmPasswordVar === password && confirmPasswordVar.length > 0);
    }

    // ✅ 회원가입 요청
    const handleSubmit = async () => {
        if (!emailVerify || !passwordVerify || !confirmPasswordVerify) {
            Alert.alert("입력 오류", "필수 항목을 올바르게 입력하세요.");
            return;
        }
    
        const userData = { email, password };
    
        try {
            const res = await axios.post("http://10.0.2.2:5001/register", userData);
    
            console.log("서버 응답:", res.data);
            if (res.data.status === "ok" && res.data.token) {
                Alert.alert("회원가입 성공", "가입이 완료되었습니다!");
    
                await AsyncStorage.setItem("token", res.data.token);
                await AsyncStorage.setItem("isNewUser", "true");
                await AsyncStorage.setItem("user_email", email);
                
                await getData(); // ✅ 회원가입 후 사용자 정보 불러오기

                navigation.replace("UserInfo");
            } else {
                Alert.alert("회원가입 실패", res.data.message || "다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원가입 오류:", error.response?.data || error.message);
            Alert.alert("오류", "회원가입 중 문제가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Feather name="chevron-left" size={28} color="white" />
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.title}>회원 가입</Text>
                <Text style={styles.subtitle}>e-mail 주소로 가입하기</Text>

                {/* ✅ 이메일 입력 */}
                <TextInput
                    style={styles.input}
                    placeholder="이메일 주소 입력"
                    value={email}
                    onChange={handleEmail}
                />
                {email.length > 0 && !emailVerify && (
                    <Text style={styles.errorText}>올바른 이메일 형식을 입력하세요.</Text>
                )}

                {/* ✅ 비밀번호 입력 */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={handlePassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Feather name={showPassword ? "eye" : "eye-off"} color={"grey"} size={23} />
                    </TouchableOpacity>
                </View>
                {password.length > 0 && !passwordVerify && (
                    <Text style={styles.errorText}>10자 이상, 소문자, 숫자, 특수문자 포함</Text>
                )}

                {/* ✅ 비밀번호 확인 */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    secureTextEntry
                    value={confirmPassword}
                    onChange={handleConfirmPassword}
                />
                {confirmPassword.length > 0 && !confirmPasswordVerify && (
                    <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                )}

                {/* ✅ 회원가입 버튼 */}
                <TouchableOpacity
                    style={[styles.signupButton, (!emailVerify || !passwordVerify || !confirmPasswordVerify) && styles.disabledButton]}
                    onPress={handleSubmit}
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
        backgroundColor: "white",
    },

    backButton: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 10,
        padding: 5,
    },

    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#444",
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 15,
    },

    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
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

    errorText: {
        marginBottom: 10,
        color: "red",
        textAlign: "left",
        alignSelf: "flex-start",
        marginLeft: 10,
    },

    signupButton: {
        backgroundColor: "#FBAF8B",
        padding: 15,
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },

    disabledButton: {
        backgroundColor: "#ccc",
    },

    signupText: {
        color: "white",
        fontSize: 16,
    },
});

export default SignupScreen;
