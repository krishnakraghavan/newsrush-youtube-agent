require('dotenv').config();
const { fetchChannelVideosById } = require('youtubeFetcher');
const { getKeywords, saveVideoToFirestore, getYouTubeChannels } = require('firestoreService');

(async () => {
  try {
    const keywords = await getKeywords();
    const channels = await getYouTubeChannels();

    for (let { name, id, lang } of channels) {
      console.log(`\n🎥 Fetching videos for ${name}...`);
      const videos = await fetchChannelVideosById(id, keywords);
      console.log(`📦 ${videos.length} videos retrieved.`);
      for (let video of videos) {
        if (video.id.kind !== 'youtube#video') continue;
        await saveVideoToFirestore(video, lang);
        console.log(`✅ Saved: ${video.snippet.title}`);
      }
    }
    console.log('\n🚀 All videos fetched and saved!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
