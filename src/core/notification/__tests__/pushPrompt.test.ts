import { appStorage, StorageKeys } from '@/core/storage';
import {
  canAutoPrompt,
  parsePushPromptHistory,
  PUSH_PROMPT_COOLDOWN_MS,
  PUSH_PROMPT_MAX_AUTO,
  recordPushPromptDismissed,
  recordPushPromptShown,
  shouldAutoPrompt,
  toPushPermission,
} from '../pushPrompt';

const NOW = 1_700_000_000_000;
const fresh = { shownCount: 0, dismissedAt: null };

describe('toPushPermission', () => {
  it.each([
    ['granted', 'enabled'],
    ['limited', 'enabled'],
    ['denied', 'askable'],
    ['blocked', 'blocked'],
    ['unavailable', 'unavailable'],
  ] as const)('%s → %s', (status, expected) => {
    expect(toPushPermission(status)).toBe(expected);
  });
});

describe('canAutoPrompt', () => {
  it('prompts a fresh install while the OS can ask', () => {
    expect(canAutoPrompt('askable', fresh, NOW)).toBe(true);
  });

  it.each(['enabled', 'blocked', 'unavailable'] as const)('never prompts when %s', permission => {
    expect(canAutoPrompt(permission, fresh, NOW)).toBe(false);
  });

  it('waits 48h after a dismissal', () => {
    const history = { shownCount: 1, dismissedAt: NOW };
    expect(canAutoPrompt('askable', history, NOW + PUSH_PROMPT_COOLDOWN_MS - 1)).toBe(false);
    expect(canAutoPrompt('askable', history, NOW + PUSH_PROMPT_COOLDOWN_MS)).toBe(true);
  });

  it('stops after the lifetime cap', () => {
    const history = { shownCount: PUSH_PROMPT_MAX_AUTO, dismissedAt: null };
    expect(canAutoPrompt('askable', history, NOW)).toBe(false);
  });
});

describe('parsePushPromptHistory', () => {
  it('falls back to a fresh history on missing or corrupt values', () => {
    expect(parsePushPromptHistory(undefined)).toEqual(fresh);
    expect(parsePushPromptHistory('{oops')).toEqual(fresh);
    expect(parsePushPromptHistory('"text"')).toEqual(fresh);
    expect(parsePushPromptHistory(JSON.stringify({ shownCount: 'x' }))).toEqual(fresh);
  });
});

describe('stored history', () => {
  beforeEach(() => appStorage.delete(StorageKeys.PUSH_PROMPT));

  it('counts shows and applies the cooldown from the last dismissal', () => {
    recordPushPromptShown();
    recordPushPromptDismissed(NOW);
    expect(parsePushPromptHistory(appStorage.get(StorageKeys.PUSH_PROMPT))).toEqual({
      shownCount: 1,
      dismissedAt: NOW,
    });
    expect(shouldAutoPrompt('askable', NOW + 1)).toBe(false);
    expect(shouldAutoPrompt('askable', NOW + PUSH_PROMPT_COOLDOWN_MS)).toBe(true);
  });

  it('never prompts again after three shows', () => {
    for (let i = 0; i < PUSH_PROMPT_MAX_AUTO; i += 1) recordPushPromptShown();
    expect(shouldAutoPrompt('askable', NOW)).toBe(false);
  });
});
