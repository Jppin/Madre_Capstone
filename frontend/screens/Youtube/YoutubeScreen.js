  import React,{useEffect,useState,useContext} from 'react';
  import {  View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator,StyleSheet } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ 추가
  import { AuthContext } from '../../context/AuthContext';
  import createAPI from '../../api'; 

  const YoutubeScreen = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [likedVideos, setLikedVideos] = useState([]); // ✅ 사용자가 좋아한 영상 목록 추가
    const { getData } = useContext(AuthContext);
    const [nickname, setNickname] = useState("");
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            console.error("❌ 토큰이 없습니다.");
            return;
          }
      
          const api = await createAPI();
      
          const res = await api.get("/user-full-data", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // GET에는 생략해도 무방하지만 유지해도 OK
            },
          });
      
          const json = res.data;
      
          if (json.status === "ok") {
            setNickname(json.data.nickname || "사용자");
          } else {
            console.error("사용자 데이터를 불러오는 중 오류:", json.message);
          }
        } catch (error) {
          console.error("데이터 불러오기 오류:", error);
        }
      };
      fetchUserData() ;

      
      const fetchVideos = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            console.error("❌ 토큰이 없습니다 (영상 요청)");
            return;
          }
        const api = await createAPI();
          console.log("🔄 Fetching YouTube Shorts...");
          const response = await api.get('/youtube', {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          console.log("✅ API Response:", response.data);
          if (response.data && response.data.results) {
            const extractedVideos = response.data.results.flatMap(item => item.videos || []);
            console.log("✅ Extracted Videos:", extractedVideos);
            setVideos(extractedVideos);
          } else {
            console.warn("⚠️ Unexpected API response:", response.data);
            setVideos([]);
          }

        // ✅ 좋아요한 동영상 (임의의 유튜브 영상 데이터 추가)
    setLikedVideos([
      { 
        id: "liked1", 
        title: "명진아 힘내", 
        thumbnail: "https://img.youtube.com/vi/nW0yrwh5H68/0.jpg ", 
        channel: "jppin tv", 
        videoUrl: "https://www.youtube.com/shorts/nW0yrwh5H68" 
      },
      { 
        id: "liked2", 
        title: "현서야 힘내", 
        thumbnail: "https://img.youtube.com/vi/lnhiqUN8kw0/0.jpg", 
        channel: "jppin tv", 
        videoUrl: "https://www.youtube.com/watch?v=lnhiqUN8kw0" 
      },
      { 
        id: "liked3", 
        title: "주예야 힘내", 
        thumbnail: "https://img.youtube.com/vi/tgbNymZ7vqY/0.jpg", 
        channel: "jppin tv", 
        videoUrl: "https://www.youtube.com/watch?v=tgbNymZ7vqY" 
      },
    ]);
        } catch (error) {
          console.error("❌ Error fetching YouTube videos:", error.response?.data || error.message || error);
        } finally {
          setLoading(false);
        }      
    };
    fetchVideos();
  }, []);
  
    if (loading) {
      return <ActivityIndicator size="large" color="#FBAF8B" style={{ flex: 1, justifyContent: 'center' }} />;
    }
  //카드에 썸네일 
    const renderItem = ({ item }) => (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('PlayerScreen', { videoId: item.id })}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        

      
        {/* 🔹 채널명과 조회수 (왼쪽 정렬) */}
        <View style={styles.videoInfo}>
          <Text style={styles.channel}>{item.channel}</Text>
          <Text style={styles.views}>{item.views ? `${item.views}회` : ""}</Text>
        </View>
      </TouchableOpacity>
    );


    return (

      <View style={styles.container}>
         {/* 상단 배너 */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/icons/redshorts.png")} 
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

    {/* ✅ 사용자가 좋아한 영상 (최상단 카드) */}
    <View style={styles.likedContainer}>
        {likedVideos.length > 0 && (
          <TouchableOpacity
            style={styles.likedCard}
            onPress={() => navigation.navigate('LikedVideoScreen',{ likedVideos })} // ✅ 클릭 시 좋아한 동영상 목록 페이지로 이동
          >
            <Image source={{ uri: likedVideos[0].thumbnail }} style={styles.likedThumbnail} />

            {/* ✅ 중앙 Like 아이콘 */}
          <View style={styles.likeOverlay}>
            <Image source={require("../../assets/icons/like.png")} style={styles.likeIcon} />
              <Text style={styles.likeText}>Likes</Text>
          </View>
          </TouchableOpacity>
          
        )}
        {/* ✅ "Likes" 라벨 (카드 옆 공간에 배치) */}

      <Text style={styles.likeLabelText}>▶   내가 좋아한 동영상 </Text>


  </View>
    
    {/* ✅ 쇼츠 영상 (그리드) */}
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
    elevation: 3, // 그림자 효과
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
  likedContainer :{ 
    flexDirection: "row", // ✅ 카드와 Likes 라벨을 가로 정렬
    alignItems: "center", // ✅ 수직 중앙 정렬
    marginLeft: 20, // ✅ 전체 왼쪽 배치
  },
  likedCard : {
    marginHorizontal: 10,
    marginVertical: 20,
    width : "40%",

    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
    elevation: 5, // ✅ 그림자 효과 추가
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,

  
  },
  likedThumbnail : {
    width: "100%",
    height: 130,
    borderRadius: 15,
  },
  likeOverlay : {

    position: "absolute",
    top: 26, // ✅ 카드 내부 상단 중앙 배치
    left: "50%",
    transform: [{ translateX: -25 }], // 정확히 중앙 정렬
    alignItems: "center",
    borderRadius: 50,
    width: 50,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  likeIcon:{
    width: 40,
    height: 40,
   
  },
  likeText : {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    marginTop: 2,
  }, 
  likeLabelText : { 
    color:"gray"
  }


});

export default YoutubeScreen;

