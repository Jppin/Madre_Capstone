//ConcernsEdit2.js


import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from "react-native-vector-icons/Feather";
import CustomSpinner from '../../components/CustomSpinner';







const ConcernsEdit2 = () => {
    const navigation = useNavigation();

    // ✅ 상태 관리
    const [selectedConcerns, setSelectedConcerns] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    


    // ✅ 건강 고민 목록
    const skinConcerns = [
        "기미/잡티/색소침착", "피부 트러블/여드름", "탈모/모발 건강", "손톱 강화"
    ];

    const lifestyleConcerns = [
        "눈 건강", "운동능력/근육량", "간 건강", "혈당 관리", "치아/잇몸", "노화/향산화", "기억력/인지력", "뼈 건강", "관절 건강"
    ];

    const otherConcerns = [
        "수유 준비", "수분 보충/탈수 예방", "출산 후 회복(산후 관리 준비)"
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
            const prevConcerns = JSON.parse(await AsyncStorage.getItem("user_concerns")) || [];
            const mergedConcerns = Array.from(new Set([...prevConcerns, ...selectedConcerns]));

            const response = await fetch("http://10.0.2.2:5001/update-user-concerns", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ concerns: mergedConcerns }),
            });

            const result = await response.json();
            console.log("🟢 서버 응답:", result);

            if (result.status === "ok") {
                console.log("✅ 건강 고민 업데이트 성공!");
                // ✅ 업데이트 성공 시 AsyncStorage에도 반영
                await AsyncStorage.setItem("user_concerns", JSON.stringify(mergedConcerns));

                Alert.alert("완료", "정보가 수정되었습니다.\n수정된 정보를 기반으로 홈이 갱신됩니다.", [
                    { 
                      text: "확인", 
                      onPress: () => {
                        navigation.navigate("MyPageScreen");
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


            <View style={{ height: 40 }} />


            <View contentContainerStyle={styles.concernContainer} showsVerticalScrollIndicator={false}>
                        
                            {/* 피부/외형 변화 */}
                            <View style={styles.subtitleWrapper}>
                                <View style={styles.dot} />
                                <Text style={styles.subtitle}>피부/외형 변화</Text>
                                <View style={styles.dot} />
                            </View>
                            <View style={styles.concernRow}>
                                {skinConcerns.map((concern, index) => (
                                    <TouchableOpacity
                                        key={`skin-${index}`}
                                        style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                                        onPress={() => toggleConcern(concern)}
                                    >
                                        <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                            {concern}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
            
                            {/* 생활습관 & 웰빙 */}
                            <View style={styles.subtitleWrapper}>
                                <View style={styles.dot} />
                                <Text style={styles.subtitle}>생활습관 & 웰빙</Text>
                                <View style={styles.dot} />
                            </View>
                            <View style={styles.concernRow}>
                                {lifestyleConcerns.map((concern, index) => (
                                    <TouchableOpacity
                                        key={`life-${index}`}
                                        style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                                        onPress={() => toggleConcern(concern)}
                                    >
                                        <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                            {concern}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
            
                            {/* 기타 고민 */}
                            <View style={styles.subtitleWrapper}>
                                <View style={styles.dot} />
                                <Text style={styles.subtitle}>기타 고민</Text>
                                <View style={styles.dot} />
                            </View>
                            <View style={styles.concernRow}>
                                {otherConcerns.map((concern, index) => (
                                    <TouchableOpacity
                                        key={`other-${index}`}
                                        style={[styles.concernButton, selectedConcerns.includes(concern) && styles.selectedButton]}
                                        onPress={() => toggleConcern(concern)}
                                    >
                                        <Text style={[styles.concernText, selectedConcerns.includes(concern) && styles.selectedText]}>
                                            {concern}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

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
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginTop: 50,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FBAF8B',
        borderRadius: 4,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 10,
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
        marginTop: 50,
        marginBottom: 5,
    },
    sulmeyong: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        color : 'grey',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    concernContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    concernContainer2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        
    },
    concernRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    concernButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 3,
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
    subtitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        
      },
      dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FBAF8B',
        marginHorizontal: 8,
      },
});

export default ConcernsEdit2;
