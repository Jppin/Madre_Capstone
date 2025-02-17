import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const data = [
  { id: '1', title: '영상 제목 1', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '2', title: '영상 제목 2', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '3', title: '영상 제목 3', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '4', title: '영상 제목 4', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '5', title: '영상 제목 5', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '6', title: '영상 제목 6', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '7', title: '영상 제목 7', description: '세부사항, 간략하게, 자세한 설명' },
  { id: '8', title: '영상 제목 8', description: '세부사항, 간략하게, 자세한 설명' },
];

const YoutubeScreen = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState(""); // 닉네임 상태 저장

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const storedNickname = await AsyncStorage.getItem("user_nickname");
            setNickname(storedNickname || "사용자");
        } catch (error) {
            console.error("닉네임 불러오기 오류:", error);
            setNickname("사용자"); // 에러 발생 시 기본값 설정
        }
    };

    fetchUserData();
  }, []);
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image
        source={require("../assets/icons/ex1.png")}
        style={styles.thumbnail}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/icons/redshorts.png")} 
          style={styles.iconStyle}
        />
         <View style={styles.textContainer}>
          <Text style={styles.header}>
            <Text style={styles.whiteText}>{nickname}</Text>
            <Text style={styles.blackText}>님</Text>
            {'\n'}
            <Text style={styles.blackText}>맞춤 컨텐츠를 확인하세요!</Text>
          </Text>
        </View>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FBAF8B",
    paddingVertical: 20, // 상하 여백 추가하여 헤더 높이 증가
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  textContainer: {
    flexShrink: 1, // 텍스트가 자동으로 줄바꿈되도록 설정
    alignItems: 'flex-start', // 텍스트 왼쪽 정렬
    justifyContent: 'center', // 세로 중앙 정렬
  },
  header: {
    fontWeight: 'bold',
    lineHeight: 45, // 줄 간격 조정
    marginLeft: -50, // 텍스트를 왼쪽으로 이동하여 이미지와 겹치게 함
    
     // 위쪽에서의 거리 조정하여 텍스트가 중앙에 위치하도록 조절
    zIndex: 1, // 텍스트를 이미지 위로 올림
  },
  whiteText: {
    color: 'white',
    fontSize: 30,
  },
  blackText: {
    color: 'black',
    fontSize: 22,
  },
  iconStyle: {
    opacity:0.4,
    width: 70,  // 아이콘 크기 증가
    height: 70,  // 아이콘 크기 증가
    marginleft: -15,
    marginRight: 10,  // 텍스트와의 거리 조절
  },
  row: {
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    margin: 5,
    elevation: 3, // 그림자 효과
  },
  thumbnail: {
    width: 150,
    height: 250,
    borderRadius: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  description: {
    fontSize: 12,
  },
});

export default YoutubeScreen;

