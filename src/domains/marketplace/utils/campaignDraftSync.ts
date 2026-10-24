import { createIdempotentAction, extractServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import type { CampaignDetail } from '../types/campaign';
import type {
  CampaignDraftRequest,
  CampaignDraftSection,
  CampaignDraftSections,
  CampaignDraftValues,
} from '../types/campaignDraft';
import { isCampaignConflictError } from './campaignAction';
import {
  dirtyDraftSections,
  draftSectionKey,
  draftSectionsOf,
  draftValuesFromCampaign,
} from './campaignDraft';

/** What stops the save queue. `invalid` doesn't stop it: one refused part never blocks the others. */
export type CampaignDraftFailure =
  /** 20 drafts already (`campaign_draft_limit`): free one, then `retry`. */
  | { kind: 'limit'; error: AppApiError }
  /** The campaign moved or went away under the brand (409 `campaign_*`, 404): reload it. */
  | { kind: 'conflict'; error: AppApiError }
  /** Offline, timeout or a server error: the next edit or `flush` tries again. */
  | { kind: 'network'; error: AppApiError };

/** A part the server refused (422): shown under its fields until the brand changes it. */
export interface CampaignDraftRefusal {
  error: AppApiError;
  /** Server field name → first message (`seat_price_usd`, `drop_at`…), when it sent them. */
  fields: Record<string, string>;
}

export interface CampaignDraftSyncState {
  /** A request is out. */
  saving: boolean;
  /** An edit is waiting for the quiet time to pass (or for the request in flight to finish). */
  pending: boolean;
  failure: CampaignDraftFailure | null;
  refused: Partial<Record<CampaignDraftSection, CampaignDraftRefusal>>;
}

export interface CampaignDraftSyncDeps {
  /** `idempotencyKey`: one per draft the brand starts, so a lost answer never makes a second draft. */
  create: (body: CampaignDraftRequest, idempotencyKey: string) => Promise<CampaignDetail>;
  update: (id: string, body: CampaignDraftRequest) => Promise<CampaignDetail>;
  onChange: (state: CampaignDraftSyncState) => void;
  onCreated: (campaignId: string) => void;
  /** Quiet time after the last edit before the queue runs; `null` = only `flush` saves (a live campaign). */
  delayMs: number | null;
  /** The wire parts of a form; default every draft part. A live campaign leaves some out. */
  sectionsOf?: (values: CampaignDraftValues) => CampaignDraftSections;
  /** Key factory for the create; default a uuid v4. */
  newKey?: () => string;
}

export interface CampaignDraftSyncer {
  /** An existing draft is open: it is the saved state, so only real edits get sent. */
  seed: (campaign: CampaignDetail) => void;
  /** The wizard's current content; saved after `delayMs` of quiet. */
  want: (sections: CampaignDraftSections) => void;
  /** Save now and resolve when everything sendable is saved or the queue is blocked. */
  flush: () => Promise<void>;
  /** After freeing a draft (`limit`) or reloading (`conflict`): drop the block and try again. */
  retry: () => Promise<void>;
  /** The draft exists on the server and nothing blocks the queue: later steps can save too. */
  canContinue: () => boolean;
  /** Something differs from what is saved (refused parts included). */
  hasChanges: () => boolean;
  /** Parts that may no longer be sent (locked): their refusals go, so they stop showing. */
  forget: (sections: readonly CampaignDraftSection[]) => void;
}

const INITIAL: CampaignDraftSyncState = { saving: false, pending: false, failure: null, refused: {} };

const toFailure = (err: unknown): CampaignDraftFailure | { kind: 'invalid'; error: AppApiError } => {
  const error = normalizeApiError(err);
  if (error.code === 'campaign_draft_limit') return { kind: 'limit', error };
  if (error.statusCode === 404 || isCampaignConflictError(error)) return { kind: 'conflict', error };
  if (error.isValidationError) return { kind: 'invalid', error };
  return { kind: 'network', error };
};

/**
 * The wizard's autosave queue (contract §3.2). The first save creates the draft from the title;
 * every later one is a PUT of a single changed part, one at a time and in `CAMPAIGN_DRAFT_SECTION`
 * order (later parts are validated against earlier ones). Edits made while a save is in flight are
 * picked up by the same run, so there is never more than one request out. A refused part
 * (422) is recorded and skipped until it changes again; limit, conflict and network failures stop
 * the queue.
 */
export const createCampaignDraftSyncer = (deps: CampaignDraftSyncDeps): CampaignDraftSyncer => {
  const sectionsOf = deps.sectionsOf ?? draftSectionsOf;
  let campaignId: string | null = null;
  let saved: CampaignDraftSections = {};
  let desired: CampaignDraftSections = {};
  const refusedKeys: Partial<Record<CampaignDraftSection, string>> = {};
  let state = INITIAL;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running: Promise<void> | null = null;
  const createIntent = createIdempotentAction(deps.newKey);
  // What the open create key was first sent with. A retry after a lost answer resends it as is (a
  // new title under the same key is `idempotency_key_reused`); a newer title follows as a PUT.
  let createBody: CampaignDraftRequest | null = null;

  const setState = (patch: Partial<CampaignDraftSyncState>) => {
    state = { ...state, ...patch };
    deps.onChange(state);
  };

  const withRefusal = (section: CampaignDraftSection, refusal: CampaignDraftRefusal | null) => {
    const next = { ...state.refused };
    if (refusal) next[section] = refusal;
    else delete next[section];
    return next;
  };

  const nextSection = (): CampaignDraftSection | null => {
    if (state.failure) return null;
    if (campaignId === null) {
      const title = desired.title;
      return title && draftSectionKey(title) !== refusedKeys.title ? 'title' : null;
    }
    return dirtyDraftSections(saved, desired, refusedKeys)[0] ?? null;
  };

  const save = async (section: CampaignDraftSection) => {
    const wanted = desired[section];
    if (!wanted) return;
    const creating = campaignId === null;
    const fragment = creating ? (createBody ??= wanted) : wanted;
    try {
      if (campaignId === null) {
        const created = await createIntent.run(key => deps.create(fragment, key));
        createBody = null;
        campaignId = created.id;
        // The server's own defaults are the baseline, so untouched parts aren't re-sent.
        saved = sectionsOf(draftValuesFromCampaign(created));
        saved[section] = fragment;
        deps.onCreated(created.id);
      } else {
        await deps.update(campaignId, fragment);
        saved = { ...saved, [section]: fragment };
      }
      delete refusedKeys[section];
      setState({ refused: withRefusal(section, null) });
    } catch (err) {
      const failure = toFailure(err);
      // Only a lost answer may have made the draft; any other refusal means nothing was stored.
      if (creating && failure.kind !== 'network') {
        createBody = null;
        createIntent.reset();
      }
      if (failure.kind === 'invalid') {
        refusedKeys[section] = draftSectionKey(fragment);
        setState({
          refused: withRefusal(section, {
            error: failure.error,
            fields: extractServerFieldErrors(err) ?? {},
          }),
        });
      } else {
        setState({ failure });
      }
    }
  };

  const drain = async () => {
    if (nextSection() === null) {
      setState({ pending: timer !== null });
      return;
    }
    setState({ saving: true });
    try {
      for (let section = nextSection(); section !== null; section = nextSection()) {
        await save(section);
      }
    } finally {
      setState({ saving: false, pending: timer !== null });
    }
  };

  const start = () => {
    running ??= drain().finally(() => {
      running = null;
    });
    return running;
  };

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const flush = async () => {
    clearTimer();
    if (state.failure?.kind === 'network') setState({ failure: null });
    // An edit can land just as a run ends; loop until nothing sendable is left.
    do {
      await start();
    } while (nextSection() !== null);
  };

  return {
    seed: campaign => {
      campaignId = campaign.id;
      saved = sectionsOf(draftValuesFromCampaign(campaign));
      desired = saved;
    },
    want: sections => {
      desired = sections;
      const failure = state.failure?.kind === 'network' ? null : state.failure;
      if (deps.delayMs === null) {
        setState({ failure });
        return;
      }
      setState({ pending: true, failure });
      clearTimer();
      timer = setTimeout(() => {
        timer = null;
        start().catch(() => undefined);
      }, deps.delayMs);
    },
    flush,
    retry: async () => {
      setState({ failure: null });
      await flush();
    },
    canContinue: () => campaignId !== null && state.failure === null,
    hasChanges: () => dirtyDraftSections(saved, desired).length > 0,
    forget: sections => {
      const refused = { ...state.refused };
      sections.forEach(section => {
        delete refusedKeys[section];
        delete refused[section];
      });
      setState({ refused });
    },
  };
};
