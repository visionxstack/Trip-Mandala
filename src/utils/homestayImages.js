/**
 * homestayImages.js
 * -----------------
 * Centralized local homestay image pool.
 * Images are imported once by Vite and cycle across homestay cards.
 *
 * Priority order (applied by getHomestayImage):
 *   1. Host-uploaded images  (homestay.images array from API)
 *   2. Local hs*.png assets  (this file)
 *   3. Dataset image_url     (from API response)
 *   4. getLocationImage()    (existing remote/Unsplash fallback)
 */

import hs1  from '../../img/hs1.png';
import hs2  from '../../img/hs2.png';
import hs3  from '../../img/hs3.png';
import hs4  from '../../img/hs4.png';
import hs5  from '../../img/hs5.png';
import hs6  from '../../img/hs6.png';
import hs7  from '../../img/hs7.png';
import hs8  from '../../img/hs8.png';
import hs9  from '../../img/hs9.png';
import hs10 from '../../img/hs10.png';
import hs11 from '../../img/hs11.png';
import hs12 from '../../img/hs12.png';

/** Ordered pool — index 0 = hs1, index 1 = hs2, etc. */
export const homestayImagePool = [
  hs1, hs2, hs3, hs4, hs5, hs6,
  hs7, hs8, hs9, hs10, hs11, hs12,
];

/**
 * Get the local hs image for a given list-position index.
 * Cycles: index 12 → hs1, index 13 → hs2, etc.
 *
 * @param {number} index — 0-based position of the homestay in the list
 * @returns {string} — bundled asset URL
 */
export function getHomestayLocalImage(index = 0) {
  return homestayImagePool[index % homestayImagePool.length];
}

/**
 * Full priority resolver for a single homestay object.
 *
 * @param {object} homestay   — API homestay record
 * @param {number} index      — 0-based position in the rendered list
 * @param {Function} fallback — getLocationImage(location, index) for remote fallback
 * @returns {string}          — image URL to render
 */
export function resolveHomestayImage(homestay, index, fallback) {
  // Priority 1: host-uploaded photos
  // We distinguish host uploads by checking if they are blob URLs (local preview)
  // or Supabase storage URLs. Dataset images (Unsplash) should NOT take priority here.
  if (Array.isArray(homestay?.images) && homestay.images.length > 0) {
    const firstImg = homestay.images[0];
    if (firstImg.startsWith("blob:") || firstImg.includes("supabase.co")) {
      return firstImg;
    }
  }

  // Priority 2: local hs asset
  return getHomestayLocalImage(index);

  // Priority 3 & 4 are handled via onError on the <img> tag
  // pointing to dataset images or fallback(homestay.location, index)
}
