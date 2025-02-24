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
        source={{ uri: `https://www.youtube.com/embed/${videoId}` }} 
        style={{ flex: 1 }} 
      />
    </View>
  );
};

export default PlayerScreen;