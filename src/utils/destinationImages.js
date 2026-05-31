/**
 * destinationImages.js
 * --------------------
 * Centralized mapping of destination names → local image assets.
 * Local images always take priority over remote/dataset URLs.
 *
 * Priority: local image → dataset image → remote fallback
 */

import BhaktapurImg   from '../../img/Bhaktapur.png';
import PokharaImg     from '../../img/Pokhara.png';
import BandipurImg    from '../../img/Bandipur.png';
import MustangImg     from '../../img/Mustang.png';
import PashupatinathImg from '../../img/Pashupatinath.png';
import BoudhanathImg  from '../../img/Boudhanath.png';
import LumbiniImg     from '../../img/Lumbini.png';
import SagarmanthaImg from '../../img/Sagarmatha.png';

/**
 * Keys are lowercase normalized names.
 * We normalize destination strings before lookup (see getLocalImage below).
 */
export const destinationImageMap = {
  bhaktapur:      BhaktapurImg,
  pokhara:        PokharaImg,
  bandipur:       BandipurImg,
  mustang:        MustangImg,
  'upper mustang': MustangImg,
  'lo manthang':  MustangImg,
  pashupatinath:  PashupatinathImg,
  'pashupatinath temple': PashupatinathImg,
  boudhanath:     BoudhanathImg,
  'boudha stupa': BoudhanathImg,
  lumbini:        LumbiniImg,
  sagarmatha:     SagarmanthaImg,
  'sagarmatha national park': SagarmanthaImg,
  everest:        SagarmanthaImg,
  'mount everest': SagarmanthaImg,
};

/**
 * Normalize a destination/site name to a lowercase key for lookup.
 * Handles partial matches: "Bhaktapur Durbar Square" → "bhaktapur"
 */
function normalize(name = '') {
  if (!name) return '';
  const lower = name.toLowerCase().trim();

  // Exact match first
  if (destinationImageMap[lower]) return lower;

  // Partial prefix match — e.g. "Bhaktapur Durbar Square" → "bhaktapur"
  for (const key of Object.keys(destinationImageMap)) {
    if (lower.startsWith(key) || lower.includes(key)) return key;
  }

  return lower;
}

/**
 * Returns the local image asset URL for a destination name, or null if not found.
 * @param {string} destinationName
 * @returns {string|null}
 */
export function getLocalImage(destinationName) {
  const key = normalize(destinationName);
  return destinationImageMap[key] || null;
}
