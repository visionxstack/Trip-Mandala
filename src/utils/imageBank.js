import { getLocalImage } from './destinationImages';

const imageBank = {
  Kathmandu: [
    "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=800&q=80", // Durbar Square
    "https://images.unsplash.com/photo-1588661642289-4b68453ccfbd?w=800&q=80", // Swayambhunath
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80", // Pashupatinath
    "https://images.unsplash.com/photo-1611080479134-8c8f0003b41d?w=800&q=80", // Thamel
    "https://images.unsplash.com/photo-1542484308-4171694f489c?w=800&q=80"  // Boudha
  ],
  Pokhara: [
    "https://images.unsplash.com/photo-1596489370603-9bb82531e0f0?w=800&q=80",
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80",
    "https://images.unsplash.com/photo-1577907577543-0c46cb8442a0?w=800&q=80",
    "https://images.unsplash.com/photo-1618776686361-9c16263ebdfb?w=800&q=80",
    "https://images.unsplash.com/photo-1585827552668-d0728b355e37?w=800&q=80"
  ],
  Mustang: [
    "https://images.unsplash.com/photo-1580216149176-3f19dc183956?w=800&q=80",
    "https://images.unsplash.com/photo-1601618228519-74d3d8a5716d?w=800&q=80",
    "https://images.unsplash.com/photo-1612015091724-4e44f3df9f99?w=800&q=80",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
    "https://images.unsplash.com/photo-1633519184511-b9623e105e4f?w=800&q=80"
  ],
  Everest: [
    "https://images.unsplash.com/photo-1522610543594-5cb4df857643?w=800&q=80",
    "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=800&q=80",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    "https://images.unsplash.com/photo-1605556276161-0027f6a73c1d?w=800&q=80",
    "https://images.unsplash.com/photo-1463138814713-2d08316238b7?w=800&q=80"
  ],
  Lalitpur: [
    "https://images.unsplash.com/photo-1612086968050-4d51a66e4a29?w=800&q=80",
    "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=800&q=80"
  ],
  Bhaktapur: [
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80",
    "https://images.unsplash.com/photo-1588661642289-4b68453ccfbd?w=800&q=80"
  ],
  Chitwan: [
    "https://images.unsplash.com/photo-1588661642289-4b68453ccfbd?w=800&q=80",
    "https://images.unsplash.com/photo-1542484308-4171694f489c?w=800&q=80"
  ],
  Default: [
    "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80",
    "https://images.unsplash.com/photo-1582235946979-d5fc64d7c041?w=800&q=80",
    "https://images.unsplash.com/photo-1587680197771-419b4ef3b3fc?w=800&q=80",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80"
  ]
};

const usedImages = new Set();

/**
 * Get an image for a location.
 * Priority: local asset → imageBank remote URL → Default remote URL
 */
export function getLocationImage(location, index = 0) {
  // Priority 1: local asset from /img/
  const local = getLocalImage(location);
  if (local) return local;

  // Priority 2: imageBank remote URL
  const loc = location || 'Default';
  let images = imageBank[loc] || imageBank.Default;
  if (!images || images.length === 0) images = imageBank.Default;

  return images[index % images.length];
}


/**
 * Get a unique image for a location. Avoids repeating images if possible.
 */
export function uniqueImage(location) {
  const loc = location || "Default";
  const images = imageBank[loc] || imageBank.Default;

  // Try to find an unused image in the pool
  for (let img of images) {
    if (!usedImages.has(img)) {
      usedImages.add(img);
      return img;
    }
  }

  // If all are used, reset the tracking for this location to avoid always getting the first image
  // Or just return a random one
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Reset used images set, useful when remounting a component
 */
export function resetImagePool() {
  usedImages.clear();
}
