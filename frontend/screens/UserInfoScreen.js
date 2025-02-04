import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    const [birthYear, setBirthYear] = useState(new Date().getFullYear());
    const [selectedGender, setSelectedGender] = useState(null);

    return (
        <View style={styles.container}>
            {/* ✅ 뒤로가기 버튼은 맨 위 (화면 최상단) */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* ✅ "내 정보 입력" 제목 (여백 확보) */}
                <Text style={styles.headerText}>내 정보 입력</Text>

                {/* ✅ 각 문항 간 충분한 여백 추가 */}
                <View style={styles.section}>
                    <Text style={styles.label}>원하는 닉네임을 입력해주세요.</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="어떻게 불러드릴까요? (예: 건강마스터)"
                        value={nickname}
                        onChangeText={setNickname}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>태어난 연도를 선택해주세요.</Text>
                    <View style={styles.pickerContainer}>
                        <RNPickerSelect
                            placeholder={{ label: "클릭해 연도를 선택하세요.", value: null }}
                            onValueChange={(value) => setBirthYear(value)}
                            items={generateYearOptions()}
                            useNativeAndroidPickerStyle={false}  
                            style={pickerSelectStyles}
                        />
                    </View>
                </View>

                <View style={styles.section}>
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
                </View>
            </ScrollView>

            {/* ✅ 회원 가입 완료하기 버튼 하단 고정 */}
            <TouchableOpacity style={styles.nextButton}>
                <Text style={styles.nextText}>회원 가입 완료하기</Text>
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
