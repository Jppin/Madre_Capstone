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

const UserInfoScreen = () => {
    const navigation = useNavigation();
    const [nickname, setNickname] = useState('');
    const [birthYear, setBirthYear] = useState(null);
    const [errors, setErrors] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');




    const validateAndProceed = async () => {
        let newErrors = {};
        if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요.';
        if (!birthYear) newErrors.birthYear = '태어난 연도를 선택해주세요.';
        if (!height.trim()) newErrors.height = '키를 입력해주세요.';
        if (!weight.trim()) newErrors.weight = '몸무게를 입력해주세요.';

        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
            try {
                await AsyncStorage.setItem("user_nickname", nickname);
                await AsyncStorage.setItem("user_birthYear", JSON.stringify(birthYear));
                await AsyncStorage.setItem("user_height", height);
                await AsyncStorage.setItem("user_weight", weight);



                setModalVisible(true);
            } catch (error) {
                console.error("AsyncStorage 저장 오류:", error);
            }
        }
    };

    const handleConfirm = () => {
        setModalVisible(false);
        navigation.navigate('SignupComplete');
    };










    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.navigate("Signup");
                    }
                }} 
                style={styles.backButton}
            >
                <Feather name="chevron-left" size={40} color="gray" />
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
                        keyboardType="default" // 한글 키보드 활성화
                        autoCapitalize="none" // 자동 대문자 비활성화
                        multiline={false} // 일부 기기에서 한글 입력 문제 해결
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
                    <Text style={styles.label}>키를 입력해주세요 (cm)</Text>
                    <TextInput
                        style={[styles.input, errors.height && styles.errorInput]}
                        placeholder="예: 165"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={(text) => {
                        setHeight(text);
                        setErrors((prev) => ({ ...prev, height: '' }));
                        }}
                    />
                    {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
                    </View>

                <View style={styles.section}>
                <Text style={styles.label}>몸무게를 입력해주세요 (kg)</Text>
                <TextInput
                    style={[styles.input, errors.weight && styles.errorInput]}
                    placeholder="예: 55"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={(text) => {
                    setWeight(text);
                    setErrors((prev) => ({ ...prev, weight: '' }));
                    }}
                />
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                </View>
            </ScrollView>


            <TouchableOpacity style={styles.nextButton} onPress={validateAndProceed}>
                <Text style={styles.nextText}>회원 가입 완료하기</Text>
            </TouchableOpacity>


            
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>입력하신 정보를 확인해주세요!</Text>
                        <Text style={styles.modalText}>닉네임: {nickname}</Text>
                        <Text style={styles.modalText}>태어난 연도: {birthYear}년</Text>
                        <Text style={styles.modalText}>키: {height}cm</Text>
                        <Text style={styles.modalText}>몸무게: {weight}kg</Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>수정하기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={[styles.modalButton, styles.confirmButton]}>
                                <Text style={styles.modalButtonText}>확인했어요!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7F4',
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: 80,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FBAF8B',
        marginBottom: 20,
        marginTop : 10,
    },
    section: {
        marginBottom: 30,
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
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: "#F9F7F4",
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
    },
    /*genderContainer: {
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
    */
    nextButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        position: 'absolute', // ✅ 하단 고정
        bottom: 50, // ✅ 화면 하단 배치
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
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: '#FBAF8B',
    },
    modalButtonText: {
        fontSize: 16,
    }
});

const pickerSelectStyles = {
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        color: '#333',
        elevation: 0,  // 내부 border 제거
    },
};

export default UserInfoScreen;
