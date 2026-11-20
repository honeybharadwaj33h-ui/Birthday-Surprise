import { PageProgressState } from '../types/romantic.js';

export function isAnswerCorrect(selectedIndex: number, correctIndex: number): boolean {
  return selectedIndex === correctIndex;
}

export function isLampPullComplete(dragDistancePx: number, thresholdPx: number = 28): boolean {
  return dragDistancePx >= thresholdPx;
}

export function canUnlockBox(boxNumber: number, openedBoxes: number[]): boolean {
  if (boxNumber === 1) return true;
  return openedBoxes.includes(boxNumber - 1);
}

export function allBoxesOpened(openedBoxes: number[], totalBoxes: number = 6): boolean {
  for (let i = 1; i <= totalBoxes; i++) {
    if (!openedBoxes.includes(i)) return false;
  }
  return true;
}

/**
 * Marks a heart on "Our Little Universe" as loved (red).
 * Once tapped, a heart stays red and never reverts to white.
 */
export function selectUniverseHeart(id: number, lovedIds: number[]): number[] {
  if (lovedIds.includes(id)) return lovedIds;
  return [...lovedIds, id];
}

export function allUniverseHeartsLoved(lovedIds: number[], totalMoments: number = 6): boolean {
  return lovedIds.length >= totalMoments;
}

export function canAdvancePage(page: number, state: PageProgressState): boolean {
  switch (page) {
    case 1:
      return state.page1Unlocked;
    case 2:
      // Must open all 6 nested gift boxes
      return allBoxesOpened(state.openedBoxes, 6);
    case 3:
      // "Our Little Universe ❤️" - tap all 6 heart buttons
      return allUniverseHeartsLoved(state.lovedUniverseIds, 6);
    case 4:
      // Love letter opened and read
      return state.letterOpened;
    case 5:
      // Final birthday page - candles blown
      return state.candlesBlown;
    default:
      return true;
  }
}

export function getPolaroidRotation(index: number): number {
  const rotations = [-3.5, 2.8, -2.1, 4.2, -1.8];
  return rotations[index % rotations.length] || 0;
}
