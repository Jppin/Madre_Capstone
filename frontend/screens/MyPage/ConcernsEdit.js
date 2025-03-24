//ConcernsEdit.js


import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from "react-native-vector-icons/Feather";
import CustomSpinner from '../../components/CustomSpinner';







const ConcernsEdit = () => {
    const navigation = useNavigation();

    // ✅ 상태 관리
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    


    // ✅ 건강 고민 목록
    const healthConcerns = [
        "눈 건강", "체지방 개선", "피부 건강", "모발 & 손톱 건강", "피로감", "스트레스/수면", "소화 & 장 건강",
        "면역 기능", "운동능력/근육량", "여성건강", "갱년기 여성건강", "비뇨기 건강", "전립선 건강",
        "노화/항산화", "치아/잇몸 건강", "심혈관 건강", "기억력 개선", 
        "뼈 건강", "관절 건강", "간 건강", "갑상선 건강", "혈중 중성지방"
    ];

    // ✅ 선택 토글 함수
    const toggleConcern = (concern) => {
        setErrorMessage('');

        setSelectedConcerns((prev) =>
            prev.includes(concern)
                ? prev.filter(item => item !== concern)
                : [...prev, concern]
        );
    };




    if (loading) {
        return <CustomSpinner />;
      }


    // ✅ MongoDB 업데이트 함수
    const updateUserInfo = async () => {
        if (selectedConcerns.length === 0) {
            setErrorMessage('고민되는 건강 항목을 선택해주세요.');
            return;
        }

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("오류", "로그인이 필요합니다.");
                return;
            }

            const response = await fetch("http://10.0.2.2:5001/update-user-concerns", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ concerns: selectedConcerns }),
            });

            const result = await response.json();
            console.log("🟢 서버 응답:", result);

            if (result.status === "ok") {
                console.log("✅ 건강 고민 업데이트 성공!");
                // ✅ 업데이트 성공 시 AsyncStorage에도 반영
                await AsyncStorage.setItem("user_concerns", JSON.stringify(selectedConcerns));

                Alert.alert("완료", "정보가 수정되었습니다. 수정된 정보를 기반으로 케어센터가 갱신됩니다.", [
                    { 
                      text: "확인", 
                      onPress: () => {
                        navigation.navigate("MainTabs", { screen: "MyPage" }); // ✅ 정확한 경로로 이동
                      }
                    }
                  ]);
            } else {
                console.error("❌ 건강 고민 업데이트 실패:", result.message);
                Alert.alert("오류", "정보 수정에 실패했습니다.");
                setLoading(false);
            }
        } catch (error) {
            console.error("❌ 건강 고민 업데이트 중 오류 발생:", error);
            Alert.alert("오류", "네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };









    return (
        <View style={styles.container}>
            

            {/* 상단 뒤로 가기 버튼 */}
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
            >
                <Feather name="chevron-left" size={40} color="gray" />
            </TouchableOpacity>





            {/* 질문 텍스트 */}
            <Text style={styles.title}>{"고민되시거나 개선하고 싶으신\n건강 고민이 있으신가요?"}</Text>

            <ScrollView contentContainerStyle={styles.concernContainer}>
                {healthConcerns.map((concern, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.concernButton,
                            selectedConcerns.includes(concern) && styles.selectedButton
                        ]}
                        onPress={() => toggleConcern(concern)}
                    >
                        <Text
                            style={[
                                styles.concernText,
                                selectedConcerns.includes(concern) && styles.selectedText
                            ]}
                        >
                            {concern}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 에러 메시지 */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* 확인 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={updateUserInfo}>
                <Text style={styles.confirmText}>정보 수정 완료하기</Text>
            </TouchableOpacity>
        </View>
    );
};

// ✅ 스타일
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 30,
        justifyContent: 'space-between',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 5,
        zIndex: 10,
        padding: 10,
    },
    backText: {
        fontSize: 24,
        color: 'black',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 110,
        marginBottom: 20,
    },
    concernContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    concernButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 2,
    },
    concernText: {
        fontSize: 14,
        color: '#666',
    },
    selectedButton: {
        backgroundColor: '#FBAF8B',
        borderColor: '#FBAF8B',
    },
    selectedText: {
        color: 'white',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 10,
    },
    confirmButton: {
        backgroundColor: '#FBAF8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 20,
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ConcernsEdit;
