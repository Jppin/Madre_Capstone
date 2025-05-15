// File: frontend/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl } from './config/config.js';

let apiInstance = null;

const createAPI = async () => {
  console.log("🔧 createAPI 내부 진입");
  //if (apiInstance) return apiInstance;

  const baseURL = await getBaseUrl();
  console.log("✅ 현재 baseURL:", baseURL);

  apiInstance = axios.create({
    baseURL,
    timeout: 60000,
  });

  // 🔐 요청마다 토큰을 Authorization 헤더에 자동 삽입
  apiInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return apiInstance;
};

export default createAPI;
