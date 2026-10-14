import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeApiError, type AppApiError } from '@/core/api';
import { useCreateDealOfferDraftMutation, useUpdateDealOfferDraftMutation } from '../../../api/dealOfferApi';
import type { DealOfferInput } from '../../../types/dealOffer';

/** Quiet enough not to save every keystroke, quick enough that leaving never loses much. */
const AUTOSAVE_MS = 1200;

export type OfferSaveState = 'idle' | 'saving' | 'saved' | 'failed';
export type OfferDraftResult = { ok: true; id: string } | { ok: false; error: AppApiError };

/**
 * The server draft behind the builder: created when the brand leaves the services step
 * (attachments need its id), then replaced quietly after every pause in editing. Saves run
 * one at a time; the newest offer always wins.
 */
export const useOfferDraft = (creatorSlug: string, offer: DealOfferInput) => {
  const [createDraft] = useCreateDealOfferDraftMutation();
  const [updateDraft] = useUpdateDealOfferDraftMutation();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<OfferSaveState>('idle');

  const key = JSON.stringify(offer);
  const keyRef = useRef(key);
  keyRef.current = key;
  const draftIdRef = useRef<string | null>(null);
  const savedKey = useRef<string | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const adopt = useCallback((id: string, savedOffer: DealOfferInput | null) => {
    draftIdRef.current = id;
    savedKey.current = savedOffer ? JSON.stringify(savedOffer) : null;
    setDraftId(id);
    setSaveState(savedOffer ? 'saved' : 'idle');
  }, []);

  /** Drops the draft from this session (a fresh offer). */
  const forget = useCallback(() => {
    draftIdRef.current = null;
    savedKey.current = null;
    setDraftId(null);
    setSaveState('idle');
  }, []);

  const ensureDraft = useCallback(async (): Promise<OfferDraftResult> => {
    if (draftIdRef.current) return { ok: true, id: draftIdRef.current };
    const sentKey = keyRef.current;
    setSaveState('saving');
    try {
      const deal = await createDraft({ creatorSlug, offer: JSON.parse(sentKey) as DealOfferInput }).unwrap();
      draftIdRef.current = deal.id;
      savedKey.current = sentKey;
      setDraftId(deal.id);
      setSaveState('saved');
      return { ok: true, id: deal.id };
    } catch (err) {
      setSaveState('failed');
      return { ok: false, error: normalizeApiError(err) };
    }
  }, [createDraft, creatorSlug]);

  /** Saves the current offer now (before sending); resolves once the server has it. */
  const flush = useCallback((): Promise<OfferDraftResult> => {
    const run = async (): Promise<OfferDraftResult> => {
      const id = draftIdRef.current;
      if (!id) return ensureDraft();
      const sentKey = keyRef.current;
      if (sentKey === savedKey.current) return { ok: true, id };
      setSaveState('saving');
      try {
        await updateDraft({ id, offer: JSON.parse(sentKey) as DealOfferInput }).unwrap();
        savedKey.current = sentKey;
        setSaveState(keyRef.current === sentKey ? 'saved' : 'saving');
        return { ok: true, id };
      } catch (err) {
        setSaveState('failed');
        return { ok: false, error: normalizeApiError(err) };
      }
    };
    const next = queue.current.then(run, run);
    queue.current = next;
    return next;
  }, [ensureDraft, updateDraft]);

  const hasLines = offer.lines.length > 0;
  useEffect(() => {
    if (!draftId || !hasLines || key === savedKey.current) return undefined;
    const timer = setTimeout(() => {
      flush();
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [draftId, flush, hasLines, key]);

  return { draftId, saveState, ensureDraft, flush, adopt, forget };
};

export type OfferDraftModel = ReturnType<typeof useOfferDraft>;
