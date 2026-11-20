export interface GiftBoxItem {
  id: number;
  boxNumber: number;
  title: string;
  photoUrl: string;
  message: string;
  ribbonColor: string;
  boxColor: string;
}

export interface PolaroidItem {
  id: number;
  photoUrl: string;
  caption: string;
  dateOrLocation: string;
  note: string;
}

export type UniverseAnimationStyle = 'petals' | 'stars' | 'hearts' | 'fireflies';

export interface UniverseMomentItem {
  id: number;
  number: number;
  theme: string;
  title: string;
  message: string;
  illustrationUrl: string;
  animationStyle: UniverseAnimationStyle;
}

export interface TimelineMilestone {
  id: number;
  step: number;
  period: string;
  title: string;
  memory: string;
  photoUrl: string;
  highlight: string;
}

export interface LoveLetterData {
  title: string;
  date: string;
  salutation: string;
  paragraphs: string[];
  signature: string;
  postscript: string;
}

export interface FinalWishData {
  celebrationTitle: string;
  wishMessage: string;
  subtext: string;
}

export interface SurpriseConfig {
  recipientName: string;
  welcomeMessage: string;
  question: string;
  options: [string, string, string];
  correctOptionIndex: number;
  giftBoxes: GiftBoxItem[];
  polaroids: PolaroidItem[];
  universeMoments: UniverseMomentItem[];
  timeline: TimelineMilestone[];
  loveLetter: LoveLetterData;
  finalWish: FinalWishData;
}

export interface PageProgressState {
  page1Unlocked: boolean;
  openedBoxes: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  viewedPolaroids: number[];
  lovedUniverseIds: number[]; // Independent red-heart states on "Our Little Universe"
  viewedTimelineSteps: number[];
  letterOpened: boolean;
  candlesBlown: boolean;
}
