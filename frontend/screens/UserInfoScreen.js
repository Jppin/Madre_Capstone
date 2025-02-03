import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

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
    const [birthYear, setBirthYear] = useState(new Date().getFullYear());  // ✅ 기본값 설정
    const [selectedGender, setSelectedGender] = useState(null);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>내 정보 입력</Text>

            <Text style={styles.label}>원하는 닉네임을 입력해주세요.</Text>
            <TextInput 
                style={styles.input} 
                placeholder="어떻게 불러드릴까요? (예: 건강마스터)"
                value={nickname}
                onChangeText={setNickname}
            />

            <Text style={styles.label}>태어난 연도를 선택해주세요.</Text>
            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    placeholder={{ label: "클릭해 연도를 선택하세요.", value: null }}
                    onValueChange={(value) => setBirthYear(value)}
                    items={generateYearOptions()}
                    useNativeAndroidPickerStyle={false}  // ✅ 크래시 방지
                    style={pickerSelectStyles}
                />
            </View>

            <Text style={styles.label}>당신의 성별을 선택해주세요.</Text>
            <View style={styles.genderContainer}>
                <TouchableOpacity 
                    style={[styles.genderButton, selectedGender === '남성' && styles.selectedGender]}
                    onPress={() => setSelectedGender('남성')}
                >
                    <Text style={[styles.genderText, selectedGender === '남성' && styles.selectedGenderText]}>남성</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.genderButton, selectedGender === '여성' && styles.selectedGender]}
                    onPress={() => setSelectedGender('여성')}
                >
                    <Text style={[styles.genderText, selectedGender === '여성' && styles.selectedGenderText]}>여성</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.nextButton}>
                <Text style={styles.nextText}>회원 가입 완료하기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },

    backButton: {
        marginBottom: 10,
    },

    backText: {
        fontSize: 20,
        color: '#333',
    },

    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FBAF8B',
        marginBottom: 20,
    },

    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
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
        marginBottom: 20,
    },

    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
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
    },

    nextText: {
        color: 'white',
        fontSize: 16,
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

export default UserInfoScreen;
