const { getYouTubeVideos } = require('../app/services/youtube_service');

(async () => {
    const results = await getYouTubeVideos('건강');
    console.log(results);
})();