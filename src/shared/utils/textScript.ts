import type { TextScript } from '@/core/theme';

// Arabic, Arabic Supplement, Arabic Extended-A, Presentation Forms-A/B.
const ARABIC_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Script that sets the optical baseline: any Arabic letter wins; `null` for blank text. */
export const detectScript = (text: string): TextScript | null => {
  if (text.trim().length === 0) {
    return null;
  }
  return ARABIC_SCRIPT.test(text) ? 'arabic' : 'latin';
};
