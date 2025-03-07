import React from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity,Linking,Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather"
import {useNavigation} from '@react-navigation/native';

const LikedVideoScreen = ({ route}) => {
    const likedVideos = route.params?.likedVideos || [];
    const navigation = useNavigation();

const screenWidth = Dimensions.get("window").width;
 
console.log("📌 likedVideos:", likedVideos); // ✅ 디버깅 로그 추가
  return (
    <View style={styles.container}>
      <TouchableOpacity 
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                 navigation.navigate("홈스크린이름"); // ✅ 홈 화면으로 이동 (필요시 변경)
               }
               }} 
               style={styles.backButton}
      >
                  <Feather name="chevron-left" size={40} color="white" />
            </TouchableOpacity>
      {/* 상단 배너 */}
      <View style={styles.headerContainer}>
                <Image
                  source={require("../../assets/icons/redshorts.png")} 
                  style={styles.iconStyle}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.header}>
                    <Text style={styles.whiteText}>MY 건강 쇼츠</Text>
                  </Text>
                </View>
              </View>
       {/* ✅ 배경 이미지 */}
     <View style={styles.backgroundContainer}>
                <Image 
                    source={require("../../assets/image4.png")} // ✅ 배경 이미지 추가
                    style={styles.backgroundImage}
                />
            </View>
      {/* 프로필 섹션 */}
      <View style={styles.profileContainer}>
        <Image source={require("../../assets/icons/10.png")} style={styles.profileImage} />
        <Text style={styles.profileText}>내가 좋아한 동영상</Text>
      </View>

      {/* ✅ 좋아한 동영상 목록 */}
      {likedVideos.length === 0 ? (
        <Text style={styles.noVideosText}>좋아요한 동영상이 없습니다.</Text>
      ) : (
        <FlatList
        
        data={
          likedVideos.length % 2 === 0
            ? likedVideos
            : [...likedVideos, { id: "empty", empty: true }] // ✅ 홀수면 빈 아이템 추가
        }
        keyExtractor={(item) => item.id}
          numColumns={2} // ✅ 2열 그리드
          columnWrapperStyle={styles.row} // ✅ 줄마다 균등 정렬
          contentContainerStyle = {{marginTop:120}}
          renderItem={({ item }) =>
            item.empty ? (
              <View style={[styles.videoCard, styles.emptyCard]} /> // ✅ 빈 카드 스타일 적용
            ) : (
              <TouchableOpacity 
                style={styles.videoCard} 
                onPress={() => Linking.openURL(item.videoUrl)} // ✅ 클릭 시 YouTube 링크 열기
              >
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.videoInfo}>{item.channel}</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
     },
     backButton: {
      position: 'absolute',
      top: 15,
      left:-10,
      zIndex: 10,
      padding: 10,
  },
     headerContainer: {
      backgroundColor: "#FBAF8B",
      paddingVertical: 20, // 상하 여백 추가하여 헤더 높이 증가
      paddingHorizontal: 20,
      height: 80,
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
    iconStyle: {
      opacity:0.4,
      width: 70,  // 아이콘 크기 증가
      height: 70,  // 아이콘 크기 증가가
      marginRight: 15,  // 텍스트와의 거리 조절
    },
    whiteText: {
      color: 'white',
      fontSize: 34,
      
    },
    // ✅ 배경 이미지 컨테이너
    backgroundContainer: {
      position: "relative",
      width: "100%",
      height: 160, // ✅ 배경 이미지 높이 설정
      alignItems: "center",
  },

  backgroundImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
  },
   // ✅ 프로필 컨테이너 (배경 이미지와 겹치도록 조정)
   profileContainer: {
    position: "absolute",
    top: 190, // ✅ 배경 이미지와 자연스럽게 겹치도록 위치 조정
    alignSelf: "center",
    alignItems: "center",
},

profileImage: {
  width: 100,
  height: 100,
  borderRadius: 100,
  borderWidth: 2, // ✅ 테두리 추가해서 선명하게
  borderColor: "#fff",
},

  profileText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "gray",
    marginTop: 5,
  },
  noVideosText: { 
    textAlign: "center", 
    fontSize: 16, 
    color: "black", 
    marginTop: 50 
  },
 // ✅ 좋아한 동영상 목록 (2열 유지)
 row: {
  flex: 1,
  justifyContent: "space-between",
  alignItems : "flex-start",
  marginHorizontal: 1, 
},
  videoCard: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: "white", 
    borderRadius: 5, 
    padding: 0.2, 
    elevation: 5,
    minHeight: 150, // ✅ 카드 높이 일정하게 유지
},
emptyCard: {
  backgroundColor: "transparent", // ✅ 빈 카드 배경 투명
  elevation: 0,
},

thumbnail: { 
    width: "100%",
    height: 120, 
    borderRadius: 8,
},
  videoTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    marginTop: 8, 
    color:"black"
  },
  videoInfo: { 
    fontSize: 12, 
    color: "gray", 
    marginTop: 4 
  },
});

export default LikedVideoScreen;

