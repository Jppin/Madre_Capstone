// utils/api.js
import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { navigate } from './navigationHelper'; // ➕ 아래에 설명 있어!

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청 시 토큰 자동 삽입
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 시 토큰 만료 감지 (401)
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      Alert.alert("로그인 만료", "다시 로그인해주세요.");
      await AsyncStorage.removeItem('token');
      navigate('Login'); // 로그인 화면으로 강제 이동
    }
    return Promise.reject(error);
  }
);

export default api;
