//NameAgeEdit.js


import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
    const [modalVisible, setModalVisible] = useState(false);
    const [updateCompleteModal, setUpdateCompleteModal] = useState(false); // ✅ 업데이트 완료 팝업 추가



    // ✅ 사용자 정보 업데이트 함수 (MongoDB 반영)
    const updateUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error("토큰 없음, 로그인 필요");
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

            setUpdateCompleteModal(true); // ✅ 업데이트 완료 모달 표시
        } else {
            console.error("❌ 사용자 정보 업데이트 실패:", result.message);
        }
    } catch (error) {
        console.error("❌ 사용자 정보 업데이트 중 오류 발생:", error);
    }
};






    const validateAndProceed = async () => {
        let newErrors = {};
        if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요.';
        if (!birthYear) newErrors.birthYear = '태어난 연도를 선택해주세요.';
        if (!selectedGender) newErrors.selectedGender = '성별을 선택해주세요.';
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            setModalVisible(true); // ✅ 확인 모달 띄우기
            }
        
    };



    // ✅ "확인했어요!" 버튼 누르면 MongoDB 업데이트 실행
    const handleConfirm = async () => {
        setModalVisible(false); // ✅ 첫 번째 모달 닫기
    
        try {
            await updateUserInfo(); // ✅ MongoDB 업데이트 실행
        } catch (error) {
            console.error("❌ 업데이트 중 오류 발생:", error);
        }
    };




    // ✅ 업데이트 완료 후 MyPageScreen으로 이동
    const handleUpdateComplete = () => {
        setUpdateCompleteModal(false);
        
        navigation.navigate("MyPageNavigator", { updated: true });
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
                <Feather name="chevron-left" size={28} color="#333" />
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

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>입력하신 정보를 확인해주세요!</Text>
                        <Text style={styles.modalText}>닉네임: {nickname}</Text>
                        <Text style={styles.modalText}>태어난 연도: {birthYear}년</Text>
                        <Text style={styles.modalText}>성별: {selectedGender}</Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText1}>수정하기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={[styles.modalButton, styles.confirmButton]}>
                                <Text style={styles.modalButtonText2}>확인했어요!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>




            {/* ✅ 두 번째 모달: 업데이트 완료 안내 */}
            <Modal visible={updateCompleteModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>✅ 업데이트 완료!</Text>
                        <Text style={styles.modalText}>정보가 저장되었습니다.</Text>
                        <TouchableOpacity onPress={handleUpdateComplete} style={styles.modalButton2}>
                            <Text style={styles.modalButtonText3}>마이페이지로 이동</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>





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
        top: 10,
        left: 10,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20, // ✅ 둥근 모서리
        width: '85%', // ✅ 모달 크기 조정
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10, // ✅ Android 그림자 효과
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color:"#FBAF8B"
    },
    modalText: {
        fontSize: 16, // ✅ 가독성 향상
        color: '#333',
        textAlign: 'center',
        marginBottom: 10, // ✅ 텍스트 간격 조정
    },
    modalButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },

    //수정하기버튼
    modalButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        marginHorizontal: 5,
    },
    //확인했어요 버튼
    confirmButton: {
        backgroundColor: '#FBAF8B', // ✅ 버튼 색상 변경
        paddingVertical: 15, // ✅ 버튼 크기 증가
        borderRadius: 12,
        width: '80%', // ✅ 버튼 너비 증가 (가운데 정렬)
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },

    //마이페이지로 이동 버튼
    modalButton2: {
        backgroundColor: "#FBAF8B", // ✅ 배경색 유지
        paddingVertical: 10, // ✅ 버튼 높이 증가
        borderRadius: 12, 
        width: "80%", // ✅ 너비 조정 (더 커짐)
        alignItems: "center",
        justifyContent: "center", // ✅ 가운데 정렬 추가
        marginTop: 20, // ✅ 버튼 간격 추가
    },



    modalButtonText1: {
        fontSize: 16,
        color: 'black',
    },
    modalButtonText2: {
        fontSize: 16,
        color: 'white',
    },
    modalButtonText3: {
        fontSize: 16,
        color: 'white',
    },

    confirmButtonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
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
