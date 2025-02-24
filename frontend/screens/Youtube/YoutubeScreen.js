import React,{useEffect,useState} from 'react';
import {  View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator,StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';



const API_URL = "http://10.0.2.2:5001/youtube"; // ✅ 백엔드 API 주소 (에뮬레이터용)


const YoutubeScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();


  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(API_URL);
        setVideos(response.data.videos); // 백엔드에서 받은 데이터 저장
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
  }
//카드에 썸네일 
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('PlayerScreen', { videoId: item.id })}
    >
      <Image
        source={{ uri: item.snippet.thumbnails.high.url }}
        style={styles.thumbnail}
      />
      <Text style={styles.title}>{item.snippet.title}</Text>
      <Text style={styles.description}>{item.snippet.channelTitle}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/icons/redshorts.png")} 
          style={styles.iconStyle}
        />
         <View style={styles.textContainer}>
          <Text style={styles.header}>
            <Text style={styles.whiteText}>홍길동동</Text>
            <Text style={styles.blackText}>님</Text>
            {'\n'}
            <Text style={styles.blackText}>맞춤 컨텐츠를 확인하세요!</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    paddingVertical: 10, // 상하 여백 추가하여 헤더 높이 증가
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 110,
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

