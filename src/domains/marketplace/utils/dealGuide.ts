import type { DealGuideParams } from '@/core/navigation';

export type BrandGuideChapterKey = 'sign' | 'reply' | 'escrow' | 'ship' | 'make' | 'review' | 'publish' | 'done';
export type CreatorGuideChapterKey =
  | 'offer'
  | 'reply'
  | 'escrow'
  | 'receive'
  | 'make'
  | 'review'
  | 'publish'
  | 'earnings';

export interface DealGuideChapter<K extends string = string> {
  key: K;
  /** Only with a physical product: tagged in the general guide, hidden in a digital deal. */
  optional: boolean;
}

const BRAND_CHAPTERS: readonly DealGuideChapter<BrandGuideChapterKey>[] = [
  { key: 'sign', optional: false },
  { key: 'reply', optional: false },
  { key: 'escrow', optional: false },
  { key: 'ship', optional: true },
  { key: 'make', optional: false },
  { key: 'review', optional: false },
  { key: 'publish', optional: false },
  { key: 'done', optional: false },
];

const CREATOR_CHAPTERS: readonly DealGuideChapter<CreatorGuideChapterKey>[] = [
  { key: 'offer', optional: false },
  { key: 'reply', optional: false },
  { key: 'escrow', optional: false },
  { key: 'receive', optional: true },
  { key: 'make', optional: false },
  { key: 'review', optional: false },
  { key: 'publish', optional: false },
  { key: 'earnings', optional: false },
];

/**
 * The guide's chapters for where it was opened: from a digital deal the shipping chapter is
 * left out entirely; from a profile / FAQ or a deal with a product it stays (tagged optional).
 */
export const guideChaptersFor = ({
  role,
  context,
  hasProduct,
}: DealGuideParams): DealGuideChapter[] => {
  const chapters: readonly DealGuideChapter[] = role === 'brand' ? BRAND_CHAPTERS : CREATOR_CHAPTERS;
  const showOptional = context === 'general' || hasProduct === true;
  return chapters.filter(chapter => showOptional || !chapter.optional);
};
