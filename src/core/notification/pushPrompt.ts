import type { UnifiedPermissionStatus } from '@/core/permissions';
import { appStorage, StorageKeys } from '@/core/storage';

/**
 * `askable`: the OS can still show its dialog (iOS not determined, Android 13+
 * not permanently denied) · `blocked`: only OS Settings can turn pushes on.
 */
export type PushPermission = 'enabled' | 'askable' | 'blocked' | 'unavailable';

export const toPushPermission = (status: UnifiedPermissionStatus): PushPermission => {
  switch (status) {
    case 'granted':
    case 'limited':
      return 'enabled';
    case 'denied':
      return 'askable';
    case 'blocked':
      return 'blocked';
    case 'unavailable':
      return 'unavailable';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

export const PUSH_PROMPT_COOLDOWN_MS = 48 * 60 * 60 * 1000;
/** Automatic prompts per install; after that only Settings offers it. */
export const PUSH_PROMPT_MAX_AUTO = 3;

export interface PushPromptHistory {
  shownCount: number;
  /** Last "Not now" (or OS dialog declined), epoch ms. */
  dismissedAt: number | null;
}

const EMPTY_HISTORY: PushPromptHistory = { shownCount: 0, dismissedAt: null };

export const parsePushPromptHistory = (raw: string | undefined): PushPromptHistory => {
  if (!raw) return EMPTY_HISTORY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_HISTORY;
    const { shownCount, dismissedAt } = parsed as Record<string, unknown>;
    return {
      shownCount: typeof shownCount === 'number' ? shownCount : 0,
      dismissedAt: typeof dismissedAt === 'number' ? dismissedAt : null,
    };
  } catch {
    return EMPTY_HISTORY;
  }
};

export const canAutoPrompt = (
  permission: PushPermission,
  history: PushPromptHistory,
  now: number,
): boolean =>
  permission === 'askable' &&
  history.shownCount < PUSH_PROMPT_MAX_AUTO &&
  (history.dismissedAt === null || now - history.dismissedAt >= PUSH_PROMPT_COOLDOWN_MS);

const readHistory = () => parsePushPromptHistory(appStorage.get(StorageKeys.PUSH_PROMPT));
const writeHistory = (history: PushPromptHistory) =>
  appStorage.set(StorageKeys.PUSH_PROMPT, JSON.stringify(history));

/** Whether an automatic trigger may show the soft prompt now. */
export const shouldAutoPrompt = (permission: PushPermission, now: number): boolean =>
  canAutoPrompt(permission, readHistory(), now);

export const recordPushPromptShown = () => {
  const history = readHistory();
  writeHistory({ ...history, shownCount: history.shownCount + 1 });
};

export const recordPushPromptDismissed = (now: number) => {
  writeHistory({ ...readHistory(), dismissedAt: now });
};
