// /controllers/youtubeController.js
import axios from "axios";
import redis from "redis";
import { AppError } from "../middleware/errorHandler.js";

const client = redis.createClient();
client.connect().catch(console.error);

const CACHE_KEY = "youtube_videos";
const CACHE_DURATION = 86400; // 24시간
const keywords = ["건강 팁", "영양제 추천", "영양성분", "운동 루틴", "약사", "비타민", "면역력"];

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export const fetchYoutubeVideos = async (req, res, next) => {
  try {
    const cachedData = await client.get(CACHE_KEY);
    if (cachedData) {
      res.json({ results: JSON.parse(cachedData) });
    }

    const videoResults = await Promise.all(
      keywords.map(async (keyword) => {
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          keyword
        )}&type=video&maxResults=10&videoDuration=short&key=${YOUTUBE_API_KEY}`;

        const response = await axios.get(youtubeApiUrl);
        const videos = response.data.items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channel: item.snippet.channelTitle,
        }));

        return { keyword, videos };
      })
    );

    await client.setEx(CACHE_KEY, CACHE_DURATION, JSON.stringify(videoResults));
    res.json({ results: videoResults });
  } catch (error) {
    next(error);
  }
};
