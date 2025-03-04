import React from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity,Linking } from "react-native";

const LikedVideoScreen = ({ route, navigation }) => {
    const likedVideos = route.params?.likedVideos || [];

console.log("📌 likedVideos:", likedVideos); // ✅ 디버깅 로그 추가
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
                    <Text style={styles.whiteText}>MY 건강 쇼츠츠</Text>
                   
                    
                  </Text>
                </View>
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
          data={likedVideos}
          keyExtractor={(item) => item.id}
          numColumns={2} // ✅ 2열 그리드
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.videoCard} 
              onPress={() => Linking.openURL(item.videoUrl)} // ✅ 클릭 시 YouTube 링크 열기
            >
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.videoInfo}>{item.channel}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingTop: 20,
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
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  noVideosText: { 
    textAlign: "center", 
    fontSize: 16, 
    color: "#666", 
    marginTop: 50 
  },
  videoCard: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: "#FFF", 
    borderRadius: 10, 
    padding: 10, 
    elevation: 3 
  },
  thumbnail: { 
    width: "100%", 
    height: 100, 
    borderRadius: 8 
  },
  videoTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    marginTop: 8 
  },
  videoInfo: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 4 
  },
});

export default LikedVideoScreen;