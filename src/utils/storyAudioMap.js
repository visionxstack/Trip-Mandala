export const storyAudioMap = {
  "pashupatinath": "/vm/Pashupatinath.mp3",
  "sagarmatha": "/vm/Sagarmatha.mp3",
  "boudhanath stupa": "/vm/Boudhanath.mp3",
  "boudhanath": "/vm/Boudhanath.mp3",
  "swayambhunath": "/vm/Swayambhunath.mp3",
  "patan durbar square": "/vm/Patan Durbar Square.mp3",
  "bhaktapur durbar square": "/vm/Bhaktapur Durbar Square.mp3",
  "muktinath": "/vm/Muktinath Temple.mp3",
  // additional aliases map
};

export const getStoryAudio = (siteName) => {
  if (!siteName) return null;
  const lowerName = siteName.toLowerCase();
  
  // NORMALIZE STORY SEARCHES
  let normalizedKey = null;
  
  if (lowerName.includes("pashupati") || lowerName.includes("pasupati")) {
    normalizedKey = "pashupatinath";
  } else if (lowerName.includes("sagarmatha") || lowerName.includes("everest")) {
    normalizedKey = "sagarmatha";
  } else if (lowerName.includes("muktinath")) {
    normalizedKey = "muktinath";
  } else if (lowerName.includes("boudha") || lowerName.includes("bouddhanath")) {
    normalizedKey = "boudhanath";
  } else if (lowerName.includes("swayambhu") || lowerName.includes("monkey temple")) {
    normalizedKey = "swayambhunath";
  } else if (lowerName.includes("patan")) {
    normalizedKey = "patan durbar square";
  } else if (lowerName.includes("bhaktapur")) {
    normalizedKey = "bhaktapur durbar square";
  } else {
    // Exact match fallback for others
    normalizedKey = lowerName.replace(/[^a-z0-9 ]/g, '').trim();
  }
  
  const audioPath = storyAudioMap[normalizedKey] || null;
  
  console.log("Selected Story:", siteName);
  console.log("Normalized Key:", normalizedKey);
  console.log("MP3 Path:", audioPath);
  
  return audioPath;
};
