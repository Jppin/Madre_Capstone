// config.js
import DeviceInfo from 'react-native-device-info';

const LOCAL_PC_IP = '10.240.165.195'; // 여기를 본인 ip주소로 고치시오!!!

export const getBaseUrl = async () => {
  const isEmulator = await DeviceInfo.isEmulator();
  return isEmulator
    ? 'http://10.0.2.2:5001' // 에뮬레이터일 경우 이 ip주소로 접근. 수정🚫🚫
    : `http://${LOCAL_PC_IP}:5001`;
};
