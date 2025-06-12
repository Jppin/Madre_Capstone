import React,{useEffect,useState,useContext} from 'react';
import {  View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator,StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ 추가
import { AuthContext } from '../../context/AuthContext';
import createAPI from '../../api'; 
import AntDesign from 'react-native-vector-icons/AntDesign';

const YoutubeScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState([]);
  const [nickname, setNickname] = useState("");
  const navigation = useNavigation();
  const { getData } = useContext(AuthContext);

  useEffect(() => {
    fetchUserData();
    fetchVideos();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const api = await createAPI();
      const res = await api.get("/user-full-data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.status === "ok") {
        setNickname(res.data.data.nickname || "사용자");
      }
    } catch (error) {
      console.error("사용자 데이터 오류:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const api = await createAPI();
      const response = await api.get('/youtube', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.results) {
        const extracted = response.data.results.flatMap(item => item.videos || []);
        setVideos(extracted);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("유튜브 영상 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isLiked = likedVideos.some((v) => v.id === item.id);
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardTouchable}
          onPress={() => navigation.navigate('PlayerScreen', { videoId: item.id })}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.videoInfo}>
            <Text style={styles.channel}>{item.channel}</Text>
            <Text style={styles.views}>{item.views ? `${item.views}회` : ""}</Text>
          </View>
        </TouchableOpacity>
        {/* 하트 버튼 (카드 우측 상단) */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AntDesign name={isLiked ? "heart" : "hearto"} size={24} color={isLiked ? "#FBAF8B" : "#aaa"} />
        </TouchableOpacity>
      </View>
    );
  };

  // 하트 버튼 렌더
  const renderHeartButton = () => (
    <TouchableOpacity
      style={styles.heartButton}
      onPress={() => navigation.navigate('LikedVideoScreen', {
        likedVideos,
        onToggleLike: toggleLike
      })}
      activeOpacity={0.7}
    >
      <Image source={require("../../assets/icons/like.png")} style={styles.heartIcon} />
    </TouchableOpacity>
  );

  const toggleLike = (video) => {
    setLikedVideos((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      if (exists) {
        return prev.filter((v) => v.id !== video.id);
      } else {
        return [video, ...prev];
      }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FBAF8B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 배너 */}
      <View style={styles.headerContainer}>
        <Image source={require("../../assets/icons/redshorts.png")} style={styles.iconStyle} />
        <View style={styles.textContainer}>
          <Text style={styles.header}>
            <Text style={styles.whiteText}>{nickname}</Text>
            <Text style={styles.blackText}>님</Text>
            {'\n'}
            <Text style={styles.blackText}>맞춤 컨텐츠를 확인하세요!</Text>
          </Text>
        </View>
        {renderHeartButton()}
      </View>

      {/* 유튜브 영상 리스트 */}
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 75 }}
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
    backgroundColor: 'black',
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    margin: 5,
    elevation: 3,
    position: "relative", // 하트 버튼 위치를 위해
  },
  cardTouchable: {
    width: "100%",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%", // ✅ 썸네일 꽉 차게
    height: 250,
    borderTopLeftRadius: 10, // 모서리 둥글게
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 10,
    textAlign: "left", // ✅ 제목 왼쪽 정렬
    color: 'white'
  },

  videoInfo : {
    flexDirection: "column", // ✅ 채널명 & 조회수 왼쪽 정렬을 위해 column 사용
    paddingHorizontal: 10,
    paddingBottom: 10,
  

  },
  channel : {
    fontSize: 12,
    color: "white",
    textAlign: "left",
    marginBottom: 2, // 간격 조정

  },
  views : {
    fontSize: 12,
    color: "white",
    textAlign: "left",

  },
  likedContainer: { 
    flexDirection: "column", // 세로로 정렬
    alignItems: "flex-start",
    marginLeft: 20,
    marginBottom: 10,
  },
  likedToggleArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  likedCard: {
    marginRight: 10,
    width: 90,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  likedThumbnail: {
    width: 90,
    height: 60,
    borderRadius: 15,
  },
  likeOverlay: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -25 }],
    alignItems: "center",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
  },
  likeIcon: {
    width: 30,
    height: 30,
  },
  likeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
    marginTop: 2,
  },
  likeLabelText: { 
    color: "gray",
    fontSize: 15,
  },
  likedListBox: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    width: 250,
    elevation: 2,
  },
  likedListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  likedListThumb: {
    width: 50,
    height: 35,
    borderRadius: 8,
  },
  heartButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  heartIcon: {
    width: 32,
    height: 32,
  },
  modalOverlay: undefined,
  likedModalBox: undefined,
  likedModalTitle: undefined,
  closeButton: undefined,
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
});

export default YoutubeScreen;

