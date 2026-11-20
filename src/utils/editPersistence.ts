import { SurpriseConfig } from '../types/romantic.js';

/**
 * Strips inline base64 data URLs before persisting SurpriseConfig into localStorage
 * so large uploaded pictures never hit the ~5MB localStorage quota.
 * Actual uploaded pictures are persisted separately in IndexedDB via mediaStorage.
 */
export function stripDataUrlsForLocalStorage(
  config: SurpriseConfig,
  fallback: SurpriseConfig
): SurpriseConfig {
  return {
    ...config,
    giftBoxes: config.giftBoxes.map((box, idx) => ({
      ...box,
      photoUrl: box.photoUrl.startsWith('data:')
        ? fallback.giftBoxes[idx]?.photoUrl || ''
        : box.photoUrl,
    })),
    universeMoments: config.universeMoments.map((m, idx) => ({
      ...m,
      illustrationUrl: m.illustrationUrl.startsWith('data:')
        ? fallback.universeMoments[idx]?.illustrationUrl || ''
        : m.illustrationUrl,
    })),
  };
}

/**
 * Merges custom uploaded photos stored in IndexedDB into the loaded SurpriseConfig.
 */
export function applyCustomPhotosToConfig(
  config: SurpriseConfig,
  photos: Record<string, string>
): SurpriseConfig {
  return {
    ...config,
    giftBoxes: config.giftBoxes.map((box) => {
      const key = `photo_gift_box_${box.boxNumber}`;
      return photos[key] ? { ...box, photoUrl: photos[key] } : box;
    }),
    universeMoments: config.universeMoments.map((m) => {
      const primaryKey = `photo_universe_${m.id}`;
      const legacyKey = `universe_illustration_${m.id}`;
      const restored = photos[primaryKey] || photos[legacyKey];
      return restored ? { ...m, illustrationUrl: restored } : m;
    }),
  };
}

export function formatLetterParagraphs(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export function parseLetterParagraphs(rawText: string): string[] {
  const parts = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [rawText.trim()];
}
