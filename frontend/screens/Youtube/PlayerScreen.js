import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

const PlayerScreen = () => {
  const route = useRoute();
  const { videoId } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView 
        source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1` }} 
        style={{ flex: 1 }} 
        javaScriptEnabled={true} 
        domStorageEnabled={true} 
        allowsInlineMediaPlayback={true}  
        mediaPlaybackRequiresUserAction={false}  
        originWhitelist={['*']}
      />
    </View>
  );
};

export default PlayerScreen;