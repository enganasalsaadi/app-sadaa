export type NumberRun = { kind: 'number'; text: string } | { kind: 'text'; text: string };

/** A sign, digits with their group/decimal separators, and a trailing percent: one LTR cluster. */
const NUMBER_CLUSTER = /[-+−]?\d(?:[\d.,٫٬]*\d)?%?/g;
/** Invisible direction marks Intl adds around Arabic output (RLM, LRM, ALM, embeddings, isolates). */
const BIDI_MARKS = /[‎‏؜‪-‮⁦-⁩]/g;
const ARABIC_LETTER = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * Splits a formatted number into number clusters and text runs. Text runs stay whole so
 * Arabic words ("ألف", "ل.س.") keep their joined letters instead of breaking per glyph.
 */
export const splitNumberRuns = (value: string): NumberRun[] => {
  const clean = value.replace(BIDI_MARKS, '');
  const runs: NumberRun[] = [];
  let cursor = 0;
  for (const match of clean.matchAll(NUMBER_CLUSTER)) {
    const start = match.index;
    if (start > cursor) runs.push({ kind: 'text', text: clean.slice(cursor, start) });
    runs.push({ kind: 'number', text: match[0] });
    cursor = start + match[0].length;
  }
  if (cursor < clean.length) runs.push({ kind: 'text', text: clean.slice(cursor) });
  return runs;
};

/** Arabic words around the number read right to left, like the same string in a paragraph. */
export const isRtlNumber = (value: string): boolean => ARABIC_LETTER.test(value);
