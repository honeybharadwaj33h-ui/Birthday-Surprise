import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAnswerCorrect,
  isLampPullComplete,
  canUnlockBox,
  allBoxesOpened,
  selectUniverseHeart,
  allUniverseHeartsLoved,
  canAdvancePage,
} from './romanticLogic.js';
import { PageProgressState } from '../types/romantic.js';

test('isAnswerCorrect returns true only for matching index', () => {
  assert.equal(isAnswerCorrect(2, 2), true);
  assert.equal(isAnswerCorrect(0, 2), false);
  assert.equal(isAnswerCorrect(1, 2), false);
});

test('isLampPullComplete triggers at or above drag threshold', () => {
  assert.equal(isLampPullComplete(0), false);
  assert.equal(isLampPullComplete(27), false);
  assert.equal(isLampPullComplete(28), true);
  assert.equal(isLampPullComplete(45), true);
});

test('canUnlockBox enforces nested sequential opening', () => {
  assert.equal(canUnlockBox(1, []), true);
  assert.equal(canUnlockBox(2, []), false);
  assert.equal(canUnlockBox(2, [1]), true);
  assert.equal(canUnlockBox(3, [1]), false);
  assert.equal(canUnlockBox(3, [1, 2]), true);
  assert.equal(canUnlockBox(6, [1, 2, 3, 4, 5]), true);
});

test('allBoxesOpened requires all 6 boxes', () => {
  assert.equal(allBoxesOpened([1, 2, 3, 4, 5]), false);
  assert.equal(allBoxesOpened([1, 2, 3, 4, 5, 6]), true);
});

test('selectUniverseHeart turns heart red and keeps it permanently selected', () => {
  let loved: number[] = [];
  loved = selectUniverseHeart(2, loved);
  assert.deepEqual(loved, [2]);
  // Tapping the same heart again keeps it red without duplicating or toggling off
  loved = selectUniverseHeart(2, loved);
  assert.deepEqual(loved, [2]);
  loved = selectUniverseHeart(5, loved);
  assert.deepEqual(loved, [2, 5]);
  assert.equal(allUniverseHeartsLoved(loved, 6), false);
  assert.equal(allUniverseHeartsLoved([1, 2, 3, 4, 5, 6], 6), true);
});

test('canAdvancePage strictly locks Continue button until requirements are met', () => {
  const baseState: PageProgressState = {
    page1Unlocked: false,
    openedBoxes: [],
    viewedPolaroids: [],
    lovedUniverseIds: [],
    viewedTimelineSteps: [],
    letterOpened: false,
    candlesBlown: false
  };

  // Page 1
  assert.equal(canAdvancePage(1, baseState), false);
  assert.equal(canAdvancePage(1, { ...baseState, page1Unlocked: true }), true);

  // Page 2 (needs all 6 boxes)
  assert.equal(canAdvancePage(2, { ...baseState, openedBoxes: [1, 2, 3] }), false);
  assert.equal(canAdvancePage(2, { ...baseState, openedBoxes: [1, 2, 3, 4, 5, 6] }), true);

  // Page 3 (Our Little Universe - needs all 6 hearts tapped)
  assert.equal(canAdvancePage(3, { ...baseState, lovedUniverseIds: [1, 2, 3] }), false);
  assert.equal(canAdvancePage(3, { ...baseState, lovedUniverseIds: [1, 2, 3, 4, 5, 6] }), true);

  // Page 4 (Love letter opened)
  assert.equal(canAdvancePage(4, { ...baseState, letterOpened: false }), false);
  assert.equal(canAdvancePage(4, { ...baseState, letterOpened: true }), true);

  // Page 5 (Birthday candles blown)
  assert.equal(canAdvancePage(5, { ...baseState, candlesBlown: false }), false);
  assert.equal(canAdvancePage(5, { ...baseState, candlesBlown: true }), true);
});
