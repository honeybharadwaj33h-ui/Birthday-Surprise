import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripDataUrlsForLocalStorage,
  applyCustomPhotosToConfig,
  formatLetterParagraphs,
  parseLetterParagraphs,
} from './editPersistence.js';
import { DEFAULT_SURPRISE_DATA } from '../data/defaultSurpriseData.js';

test('stripDataUrlsForLocalStorage removes inline base64 data URLs while preserving edited text', () => {
  const edited = {
    ...DEFAULT_SURPRISE_DATA,
    recipientName: 'Priya',
    giftBoxes: DEFAULT_SURPRISE_DATA.giftBoxes.map((b, i) =>
      i === 0
        ? { ...b, title: 'Custom Title', photoUrl: 'data:image/png;base64,AAAA1234' }
        : b
    ),
    universeMoments: DEFAULT_SURPRISE_DATA.universeMoments.map((m, i) =>
      i === 1
        ? { ...m, message: 'Custom sweet note', illustrationUrl: 'data:image/jpeg;base64,BBBB5678' }
        : m
    ),
  };

  const safe = stripDataUrlsForLocalStorage(edited, DEFAULT_SURPRISE_DATA);
  assert.equal(safe.recipientName, 'Priya');
  assert.equal(safe.giftBoxes[0].title, 'Custom Title');
  assert.equal(safe.giftBoxes[0].photoUrl, DEFAULT_SURPRISE_DATA.giftBoxes[0].photoUrl);
  assert.equal(safe.universeMoments[1].message, 'Custom sweet note');
  assert.equal(
    safe.universeMoments[1].illustrationUrl,
    DEFAULT_SURPRISE_DATA.universeMoments[1].illustrationUrl
  );
});

test('applyCustomPhotosToConfig restores IndexedDB photos for both gift boxes and universe moments', () => {
  const photos = {
    photo_gift_box_1: 'data:image/png;base64,BOX1IMG',
    photo_universe_2: 'data:image/png;base64,UNI2IMG',
    universe_illustration_3: 'data:image/png;base64,LEGACYUNI3',
  };

  const merged = applyCustomPhotosToConfig(DEFAULT_SURPRISE_DATA, photos);
  assert.equal(merged.giftBoxes[0].photoUrl, 'data:image/png;base64,BOX1IMG');
  assert.equal(merged.universeMoments[1].illustrationUrl, 'data:image/png;base64,UNI2IMG');
  assert.equal(merged.universeMoments[2].illustrationUrl, 'data:image/png;base64,LEGACYUNI3');
});

test('formatLetterParagraphs and parseLetterParagraphs round-trip cleanly', () => {
  const paragraphs = ['First paragraph.', 'Second paragraph.', 'Third paragraph.'];
  const formatted = formatLetterParagraphs(paragraphs);
  assert.deepEqual(parseLetterParagraphs(formatted), paragraphs);
});
