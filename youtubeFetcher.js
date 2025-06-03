
const axios = require('axios');

async function fetchChannelVideosById(channelId, keywords = []) {
  const url = `https://www.googleapis.com/youtube/v3/search` +
              `?key=${process.env.YOUTUBE_API_KEY}` +
              `&channelId=${channelId}` +
              `&type=video` +
              `&videoDuration=short` + // ✅ Only videos under 60s
              `&part=snippet,id` +
              `&order=date` +
              `&maxResults=10` +
              `&fields=items(id,snippet(title,description,thumbnails,publishedAt,channelTitle))`;
    console.log(process.env.YOUTUBE_API_KEY);
    console.log("Test Print in YoutubeFetcher Line 15");
    console.log('This is the URL:',url);
  const res = await axios.get(url);
  const items = res.data.items || [];

  // ✅ Filter for #shorts or keyword match
  return items.filter(item => {
    const title = item.snippet.title.toLowerCase();
    const desc = item.snippet.description.toLowerCase();
    const keywordMatch = keywords.length === 0 || keywords.some(kw =>
      title.includes(kw) || desc.includes(kw)
    );
    const isShortTag = title.includes("#shorts") || desc.includes("#shorts");

    return keywordMatch || isShortTag;
  });
}

module.exports = {
  fetchChannelVideosById
};
