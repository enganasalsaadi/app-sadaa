import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@/core/store';
import {
  brandCampaignsApi,
  campaignChangedTags,
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useUpdateCampaignMutation,
} from '../api/brandCampaignsApi';
import { CAMPAIGN_AUTOSAVE_DELAY_MS } from '../constants/campaignDraft';
import { CAMPAIGN_MISSING_KEY } from '../types/campaignDraft';
import type { CampaignDraftValues } from '../types/campaignDraft';
import {
  CAMPAIGN_LOCKED_SECTIONS,
  campaignWizardProgress,
  draftSectionsOf,
  draftValuesFromCampaign,
  emptyDraftValues,
  liveDraftSectionsOf,
} from '../utils/campaignDraft';
import { createCampaignDraftSyncer } from '../utils/campaignDraftSync';
import type { CampaignDraftSyncState } from '../utils/campaignDraftSync';
import { campaignTermsLocked } from '../utils/campaignDetail';

export type CampaignDraftSaveState = 'idle' | 'saving' | 'saved' | 'error';

/** How a live campaign's «save» ended. `locked`: the server said the terms froze; the form now shows it. */
export type CampaignLiveSaveOutcome = 'saved' | 'unchanged' | 'locked' | 'failed';

export interface UseCampaignDraftOptions {
  /**
   * Editing a published campaign: nothing saves until `saveLive` (each edit goes straight to
   * creators and the history), seats and the deadline stay with their own actions, and once the
   * terms lock only the name and announcement are sent.
   */
  live?: boolean;
}

const IDLE_SYNC: CampaignDraftSyncState = { saving: false, pending: false, failure: null, refused: {} };

/**
 * The brand wizard's draft engine. `values` is the form; `edit` changes it and the draft saves
 * itself (first the title creates it, then one request per changed part). Open an existing draft
 * by passing its id: `ready` turns true once it has loaded. Steps call `flush` before moving on
 * or leaving; unmounting saves whatever is pending. The wizard's progress comes from the server's
 * `missing[]` after each save.
 */
export const useCampaignDraft = (
  initialCampaignId: string | null = null,
  { live = false }: UseCampaignDraftOptions = {},
) => {
  const dispatch = useAppDispatch();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [values, setValues] = useState<CampaignDraftValues>(emptyDraftValues);
  const [sync, setSync] = useState(IDLE_SYNC);
  const [ready, setReady] = useState(initialCampaignId === null);
  const [locked, setLocked] = useState(false);
  const { data: campaign, error: loadError, refetch } = useGetCampaignQuery(campaignId ?? skipToken);

  const valuesRef = useRef(values);
  const syncRef = useRef(IDLE_SYNC);
  // The opened campaign's own values: the drop is sent only when it moved from here.
  const baselineRef = useRef<CampaignDraftValues>(values);
  const lockedRef = useRef(false);
  const liveRef = useRef(live);
  const readyRef = useRef(ready);
  const editedRef = useRef(false);
  const createRef = useRef(createCampaign);
  const updateRef = useRef(updateCampaign);
  createRef.current = createCampaign;
  updateRef.current = updateCampaign;

  const sectionsOf = useCallback(
    (next: CampaignDraftValues) =>
      liveRef.current ? liveDraftSectionsOf(next, baselineRef.current, lockedRef.current) : draftSectionsOf(next),
    [],
  );

  const syncer = useMemo(
    () =>
      createCampaignDraftSyncer({
        create: (body, idempotencyKey) => createRef.current({ body, idempotencyKey }).unwrap(),
        update: (id, body) => updateRef.current({ id, body }).unwrap(),
        onChange: state => {
          syncRef.current = state;
          setSync(state);
        },
        onCreated: setCampaignId,
        delayMs: liveRef.current ? null : CAMPAIGN_AUTOSAVE_DELAY_MS,
        sectionsOf,
      }),
    [sectionsOf],
  );

  // An opened draft is the saved baseline and fills the form once; later cache updates (the save
  // answers) never overwrite what the brand is typing.
  useEffect(() => {
    if (readyRef.current || !campaign) return;
    readyRef.current = true;
    const loaded = draftValuesFromCampaign(campaign);
    valuesRef.current = loaded;
    baselineRef.current = loaded;
    if (liveRef.current && campaignTermsLocked(campaign)) {
      lockedRef.current = true;
      setLocked(true);
    }
    syncer.seed(campaign);
    setValues(loaded);
    setReady(true);
  }, [campaign, syncer]);

  useEffect(
    () => () => {
      // A live campaign keeps only what «save» sent: leaving drops the rest.
      if (liveRef.current) return;
      syncer.flush().then(() => {
        // The list and the home rail show titles / counts, so they refresh once on the way out.
        if (editedRef.current) {
          dispatch(brandCampaignsApi.util.invalidateTags([{ type: 'CampaignList', id: 'LIST' }, 'BrandHome']));
        }
      });
    },
    [syncer, dispatch],
  );

  const edit = useCallback(
    (patch: Partial<CampaignDraftValues>) => {
      if (!readyRef.current) return;
      editedRef.current = true;
      const next = { ...valuesRef.current, ...patch };
      valuesRef.current = next;
      setValues(next);
      syncer.want(sectionsOf(next));
    },
    [sectionsOf, syncer],
  );

  const progress = useMemo(
    () => campaignWizardProgress(campaign ? campaign.missing : CAMPAIGN_MISSING_KEY),
    [campaign],
  );

  // Resolves true when the draft exists and nothing blocks saving, so a step can move on.
  const flush = useCallback(async () => {
    await syncer.flush();
    return syncer.canContinue();
  }, [syncer]);
  /**
   * A live campaign's «save»: sends every changed part now. The terms may have locked since the
   * page was read (`campaign_field_locked`): the frozen parts go back to their saved values and
   * the form switches to «name and announcement only» so the brand sees why.
   */
  const saveLive = useCallback(async (): Promise<CampaignLiveSaveOutcome> => {
    if (!syncer.hasChanges()) return 'unchanged';
    await syncer.flush();
    const refusals = Object.values(syncRef.current.refused);
    if (!lockedRef.current && refusals.some(refusal => refusal?.error.code === 'campaign_field_locked')) {
      lockedRef.current = true;
      setLocked(true);
      const { title, teaser } = valuesRef.current;
      const next = { ...baselineRef.current, title, teaser };
      valuesRef.current = next;
      setValues(next);
      syncer.forget(CAMPAIGN_LOCKED_SECTIONS);
      syncer.want(sectionsOf(next));
      return 'locked';
    }
    if (!syncer.canContinue() || refusals.length > 0) return 'failed';
    if (campaignId !== null) dispatch(brandCampaignsApi.util.invalidateTags([...campaignChangedTags(campaignId)]));
    return 'saved';
  }, [campaignId, dispatch, sectionsOf, syncer]);

  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  const hasRefusal = Object.keys(sync.refused).length > 0;
  let saveState: CampaignDraftSaveState = 'idle';
  if (sync.failure || hasRefusal) saveState = 'error';
  else if (sync.saving || sync.pending) saveState = 'saving';
  else if (campaignId !== null) saveState = 'saved';

  return {
    ready,
    loadError: loadError ?? null,
    campaignId,
    campaign,
    values,
    edit,
    progress,
    saveState,
    /** `limit` (20 drafts), `conflict` (the campaign changed) or `network`; blocks saving until `retry`. */
    failure: sync.failure,
    /** Parts the server refused (422), by part, with the server's field messages. */
    refused: sync.refused,
    flush,
    retry: syncer.retry,
    /** Live campaign only: the terms froze (read from the campaign, or the server said so). */
    locked,
    /** Live campaign only: edits not sent yet. */
    hasChanges: live && syncer.hasChanges(),
    saveLive,
    /** After a failed first load of a draft that was opened by id. */
    reload,
  };
};
