import type { ParseKeys } from 'i18next';

export type DayPart = 'morning' | 'evening';

/** Arabic greets in two halves: «صباح الخير» until noon, «مساء الخير» after. */
const MORNING_START = 5;
const MORNING_END = 12;

export const resolveDayPart = (hour: number): DayPart =>
  hour >= MORNING_START && hour < MORNING_END ? 'morning' : 'evening';

export const DAY_PART_GREETING = {
  morning: 'marketplace.creatorHome.greetingTime.morning',
  evening: 'marketplace.creatorHome.greetingTime.evening',
} as const satisfies Record<DayPart, ParseKeys>;
