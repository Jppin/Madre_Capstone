const axios = require('axios');
require('dotenv').config(); // .env 파일 로드

const youtubeApiKey = process.env.YOUTUBE_API_KEY;  // 환경 변수에서 API 키 가져오기

const getYouTubeVideos = async (query) => {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 10,
                q: query,
                key: youtubeApiKey,  // ✅ API 키 적용
            }
        });
        return response.data.items;
    } catch (error) {
        console.error("YouTube API 요청 실패:", error.response ? error.response.data : error.message);
        return [];
    }
};

module.exports = { getYouTubeVideos };