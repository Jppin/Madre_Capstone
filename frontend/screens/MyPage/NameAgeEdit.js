//NameAgeEdit.js


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import Feather from "react-native-vector-icons/Feather";

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let year = 1900; year <= currentYear; year++) {
        years.push({ label: `${year}년`, value: year });
    }
    return years.reverse();
};

const NameAgeEdit = () => {
    const navigation = useNavigation();
    const [nickname, setNickname] = useState('');
    const [birthYear, setBirthYear] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [errors, setErrors] = useState({});



    // ✅ 사용자 정보 업데이트 함수 (MongoDB 반영)
    const updateUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error("토큰 없음, 로그인 필요");
                Alert.alert("오류", "로그인이 필요합니다.");
                return;
            }
    
            const response = await fetch("http://10.0.2.2:5001/update-user-info", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname,
                    birthYear,
                    gender: selectedGender
                }),
            });
    
            const result = await response.json();
    
            if (result.status === "ok") {
                console.log("✅ 사용자 정보 업데이트 성공");
    
                // ✅ MongoDB 업데이트 성공하면 AsyncStorage에도 반영
                await AsyncStorage.setItem("user_nickname", nickname);
                await AsyncStorage.setItem("user_birthYear", JSON.stringify(birthYear));
                await AsyncStorage.setItem("user_gender", selectedGender);
    
                // ✅ 모달 제거하고 Alert로 메시지 띄운 후 MyPage로 이동
                Alert.alert("완료", "정보가 수정되었습니다.", [
                    { 
                      text: "확인", 
                      onPress: () => {
                        navigation.navigate("MainTabs", { screen: "MyPage" }); // ✅ 정확한 경로로 이동
                      }
                    }
                  ]);
            } else {
                console.error("❌ 사용자 정보 업데이트 실패:", result.message);
                Alert.alert("오류", "정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("❌ 사용자 정보 업데이트 중 오류 발생:", error);
            Alert.alert("오류", "네트워크 오류가 발생했습니다.");
        }
    };






    const validateAndProceed = async () => {
        let newErrors = {};
        if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요.';
        if (!birthYear) newErrors.birthYear = '태어난 연도를 선택해주세요.';
        if (!selectedGender) newErrors.selectedGender = '성별을 선택해주세요.';
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            updateUserInfo(); // ✅ 바로 업데이트 실행
            }
        
    };



    


    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();  // ✅ 이전 화면이 있으면 뒤로 가기
                    } else {
                        navigation.navigate("Login");  // ✅ 이전 화면이 없으면 Login 화면으로 이동
                    }
                }} 
                style={styles.backButton}
            >
                <Feather name="chevron-left" size={30} color="gray" />
            </TouchableOpacity>


            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerText}>내 정보 입력</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>원하시는 닉네임을 입력해주세요.</Text>
                    <TextInput 
                        style={[styles.input, errors.nickname && styles.errorInput]} 
                        placeholder="어떻게 불러드릴까요? (예: 건강마스터)"
                        value={nickname}
                        onChangeText={(text) => {
                            setNickname(text);
                            setErrors((prev) => ({ ...prev, nickname: '' }));
                        }}
                    />
                    {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>태어난 연도를 선택해주세요.</Text>
                    <View style={[styles.pickerContainer, errors.birthYear && styles.errorInput]}>
                        <RNPickerSelect
                            placeholder={{ label: "클릭해 연도를 선택하세요.", value: null }}
                            onValueChange={(value) => {
                                setBirthYear(value);
                                setErrors((prev) => ({ ...prev, birthYear: '' }));
                            }}
                            items={generateYearOptions()}
                            useNativeAndroidPickerStyle={false}  
                            style={pickerSelectStyles}
                        />
                    </View>
                    {errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>성별을 선택해주세요.</Text>
                    <View style={styles.genderContainer}>
                        <TouchableOpacity 
                            style={[styles.genderButton, selectedGender === '남성' && styles.selectedGender]}
                            onPress={() => {
                                setSelectedGender('남성');
                                setErrors((prev) => ({ ...prev, selectedGender: '' }));
                            }}
                        >
                            <Text style={[styles.genderText, selectedGender === '남성' && styles.selectedGenderText]}>남성</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.genderButton, selectedGender === '여성' && styles.selectedGender]}
                            onPress={() => {
                                setSelectedGender('여성');
                                setErrors((prev) => ({ ...prev, selectedGender: '' }));
                            }}
                        >
                            <Text style={[styles.genderText, selectedGender === '여성' && styles.selectedGenderText]}>여성</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.selectedGender && <Text style={styles.errorText}>{errors.selectedGender}</Text>}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.nextButton} onPress={validateAndProceed}>
                <Text style={styles.nextText}>정보 수정 완료하기</Text>
            </TouchableOpacity>

        


        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },

    scrollContainer: {
        flexGrow: 1,
        paddingTop: 80,  // ✅ "내 정보 입력"을 충분히 아래로 내림
    },

    backButton: {
        position: 'absolute',
        top: 20,
        left: 5,
        zIndex: 10,
        padding: 10,
    },

    backText: {
        fontSize: 20,
        color: '#333',
    },

    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FBAF8B',
        marginBottom: 40,  // ✅ "내 정보 입력"과 첫 번째 문항 사이 간격 증가
    },

    section: {
        marginBottom: 40,  // ✅ 문항 사이 간격 넓힘
    },

    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
    },

    pickerContainer: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },

    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    genderButton: {
        flex: 1,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },

    genderText: {
        fontSize: 16,
        color: '#333',
    },

    selectedGender: {
        backgroundColor: '#FBAF8B',
        borderColor: '#FBAF8B',
    },

    selectedGenderText: {
        color: 'white',
    },

    nextButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        position: 'absolute', // ✅ 하단 고정
        bottom: 20, // ✅ 화면 하단 배치
        alignSelf: 'center',
        width: '90%',
    },

    nextText: {
        color: 'white',
        fontSize: 16,
    },

    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
   
  
    


});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: '#333',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: '#333',
        paddingRight: 30,
    },
};

export default NameAgeEdit;
