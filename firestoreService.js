const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(process.env.FIREBASE_CREDENTIAL_PATH));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIRESTORE_PROJECT_ID
});

const db = admin.firestore();

async function getKeywords() {
  const snapshot = await db.collection('keywords').get();
  if (snapshot.empty) {
    console.log('ℹ️ No keywords found in Firestore. Fetching all videos.');
    return [];
  }
  return snapshot.docs.map(doc => doc.data().word.toLowerCase());
}

function detectLanguage(text) {
  const hindiChars = /[\u0900-\u097F]/;
  const teluguChars = /[\u0C00-\u0C7F]/;

  if (hindiChars.test(text)) return "hi";     // Hindi
  if (teluguChars.test(text)) return "te";    // Telugu
  return "en";                                 // Default: English
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  const categories = [
    { name: 'Politics', keywords: ['election', 'bjp', 'congress', 'modi'] },
    { name: 'Business', keywords: ['stock', 'market', 'rbi', 'inflation', 'gdp'] },
    { name: 'Entertainment', keywords: ['movie', 'film', 'actor', 'bollywood'] },
    { name: 'Sports', keywords: ['cricket', 'match', 'tournament', 'ipl'] },
  ];

  for (let cat of categories) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.name;
    }
  }
  return "General";
}

async function saveVideoToFirestore(video, languageCode = 'en') {
  const videoId = video.id.videoId;
  const ref = db.collection('videos').doc(videoId);

  const title = video.snippet.title || '';
  const description = video.snippet.description || '';
  const text = `${title} ${description}`;

  const data = {
    title,
    description,
    thumbnail: video.snippet.thumbnails.high.url,
    videoId,
    uri: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    language: languageCode, // override language
    category: detectCategory(text),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    viewCount: 0,
  };

  await ref.set(data, { merge: true });
}
module.exports = {
  getKeywords,
  saveVideoToFirestore,
};
 
