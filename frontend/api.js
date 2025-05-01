// File: frontend/api.js
import axios from 'axios';
import { getBaseUrl } from './config/config.js';

let apiInstance = null;

const createAPI = async () => {
  if (apiInstance) return apiInstance;

  const baseURL = await getBaseUrl();
  console.log("✅ 현재 baseURL:", baseURL);

  apiInstance = axios.create({
    baseURL,
    timeout: 60000,
  });

  return apiInstance;
};

export default createAPI;
