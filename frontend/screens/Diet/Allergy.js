// screens/Diet/Allergy.js

import { useState, React, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Allergy = ({ navigation }) => {
    
    
const { userData } = useContext(AuthContext);
const nickname = userData?.nickname || '사용자';
const [avoidedFoods, setAvoidedFoods] = useState("");





const handleSubmit = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    await axios.post("http://10.0.2.2:5001/mealplan/submit-avoided-foods", {
      avoidedFoods: avoidedFoods.split(',').map(f => f.trim()),
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    navigation.navigate("Diet"); // 저장 후 다음 화면으로 이동
  } catch (err) {
    console.error("🥲 음식 제출 실패:", err);
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

      {/* 상단 제목 */}
      <Text style={styles.title}>{nickname}님 맞춤 식단</Text>
        <Text style={styles.subtitle}>
        식단을 생성하기에 앞서, {nickname}님이 피해야 할 음식을 알려주세요!!😊
        </Text>


      {/* 알러지 품목 사진 */}
      <Image
      source={require('../../assets/icons/allergy.png')}
      style={styles.allergyImage}
      />


      {/* 설명 문구 */}
      <Text style={styles.description}>
        알레르기나 입덧으로 섭취하면 안되는 식품을 입력해주세요.
      </Text>

      {/* 입력창 */}
      <TextInput
        style={styles.input}
        placeholder="예시: 우유, 고등어, 대두 / 없는 경우 없음 입력 "
        placeholderTextColor="#aaa"
        value={avoidedFoods}
        onChangeText={setAvoidedFoods}
      />

        <TouchableOpacity style={styles.alertButton} onPress={handleSubmit}>
        <Image
          source={require('../../assets/icons/warning.png')}
          style={styles.alertIcon}
        />
        <Text style={styles.alertText}>알레르기 / 입덧 음식 입력 완료</Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF3DA',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#215132',
    marginBottom: 5,
    marginTop : 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#E84118',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginTop : 20,
  },
  alertIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 10,
    padding: 10,
},
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    marginTop : 20,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  allergyImage: {
    width: 400,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    
  },
  
});

export default Allergy;
