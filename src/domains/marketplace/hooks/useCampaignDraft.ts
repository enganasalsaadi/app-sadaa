import { skipToken } from '@reduxjs/toolkit/query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@/core/store';
import {
  brandCampaignsApi,
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useUpdateCampaignMutation,
} from '../api/brandCampaignsApi';
import { CAMPAIGN_AUTOSAVE_DELAY_MS } from '../constants/campaignDraft';
import { CAMPAIGN_MISSING_KEY } from '../types/campaignDraft';
import type { CampaignDraftValues } from '../types/campaignDraft';
import {
  campaignWizardProgress,
  draftSectionsOf,
  draftValuesFromCampaign,
  emptyDraftValues,
} from '../utils/campaignDraft';
import { createCampaignDraftSyncer } from '../utils/campaignDraftSync';
import type { CampaignDraftSyncState } from '../utils/campaignDraftSync';

export type CampaignDraftSaveState = 'idle' | 'saving' | 'saved' | 'error';

const IDLE_SYNC: CampaignDraftSyncState = { saving: false, pending: false, failure: null, refused: {} };

/**
 * The brand wizard's draft engine. `values` is the form; `edit` changes it and the draft saves
 * itself (first the title creates it, then one request per changed part). Open an existing draft
 * by passing its id: `ready` turns true once it has loaded. Steps call `flush` before moving on
 * or leaving; unmounting saves whatever is pending. The wizard's progress comes from the server's
 * `missing[]` after each save.
 */
export const useCampaignDraft = (initialCampaignId: string | null = null) => {
  const dispatch = useAppDispatch();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [values, setValues] = useState<CampaignDraftValues>(emptyDraftValues);
  const [sync, setSync] = useState(IDLE_SYNC);
  const [ready, setReady] = useState(initialCampaignId === null);
  const { data: campaign, error: loadError, refetch } = useGetCampaignQuery(campaignId ?? skipToken);

  const valuesRef = useRef(values);
  const readyRef = useRef(ready);
  const editedRef = useRef(false);
  const createRef = useRef(createCampaign);
  const updateRef = useRef(updateCampaign);
  createRef.current = createCampaign;
  updateRef.current = updateCampaign;

  const syncer = useMemo(
    () =>
      createCampaignDraftSyncer({
        create: body => createRef.current(body).unwrap(),
        update: (id, body) => updateRef.current({ id, body }).unwrap(),
        onChange: setSync,
        onCreated: setCampaignId,
        delayMs: CAMPAIGN_AUTOSAVE_DELAY_MS,
      }),
    [],
  );

  // An opened draft is the saved baseline and fills the form once; later cache updates (the save
  // answers) never overwrite what the brand is typing.
  useEffect(() => {
    if (readyRef.current || !campaign) return;
    readyRef.current = true;
    const loaded = draftValuesFromCampaign(campaign);
    valuesRef.current = loaded;
    syncer.seed(campaign);
    setValues(loaded);
    setReady(true);
  }, [campaign, syncer]);

  useEffect(
    () => () => {
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
      syncer.want(draftSectionsOf(next));
    },
    [syncer],
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
    /** After a failed first load of a draft that was opened by id. */
    reload,
  };
};
