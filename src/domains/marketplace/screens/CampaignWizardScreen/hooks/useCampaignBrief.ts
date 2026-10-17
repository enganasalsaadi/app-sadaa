import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastService } from '@/core/toast';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';
import { CAMPAIGN_UPLOAD_LIMIT } from '../../../constants/campaignUploads';
import type { CampaignFile } from '../../../types/campaign';
import type { CampaignDraftBrief, CampaignDraftValues } from '../../../types/campaignDraft';
import {
  activeBriefTone,
  briefTemplateEntries,
  isBriefLink,
  mergeBriefEntries,
  normalizeBriefEntry,
  toggleBriefTone,
  type BriefListField,
  type BriefTemplateKey,
  type BriefToneKey,
} from '../../../utils/briefEntries';
import type { BriefFileSource } from '../../../utils/briefFiles';
import type { CampaignDraftSyncState } from '../../../utils/campaignDraftSync';
import { useCampaignAttachments } from './useCampaignAttachments';

/** The brief's lists; a campaign also takes reference links (http/https). */
export type CampaignBriefList = BriefListField | 'links';

const PROMO_FIELD = 'private_brief.promo_code';
const TRACKING_FIELD = 'private_brief.tracking_link';

const listItemCount = (brief: CampaignDraftBrief): number =>
  brief.hashtags.length +
  brief.mentions.length +
  brief.talkingPoints.length +
  brief.donts.length +
  brief.links.length +
  (brief.promoCode.trim() === '' ? 0 : 1) +
  (brief.trackingLink.trim() === '' ? 0 : 1);

/**
 * The campaign's private brief (optional; revealed to the creator only once the deal is funded):
 * hashtags, mentions, talking points, don'ts, links, a promo code, a tracking link and up to five
 * reference files. It edits the draft like any other part, so it saves itself; the files go
 * through their own upload.
 */
export const useCampaignBrief = (
  values: CampaignDraftValues,
  edit: (patch: Partial<CampaignDraftValues>) => void,
  refused: CampaignDraftSyncState['refused'],
  campaignId: string | null,
  attached: readonly CampaignFile[],
) => {
  const { t } = useTranslation();
  const { privateBrief: brief } = values;
  const attachments = useCampaignAttachments(campaignId, attached);
  const [open, setOpen] = useState(false);
  const [filesSheet, setFilesSheet] = useState(false);

  const openSheet = useCallback(() => setOpen(true), []);
  const closeSheet = useCallback(() => setOpen(false), []);

  // — Lists ——————————————————————————————————————————————————————————
  const setList = useCallback(
    (field: CampaignBriefList, list: string[]) => edit({ privateBrief: { ...brief, [field]: list } }),
    [brief, edit],
  );

  const addEntry = useCallback(
    (field: CampaignBriefList, raw: string): boolean => {
      const entry = field === 'links' ? raw.trim().slice(0, DEAL_BRIEF_LIMITS.maxEntryLength) : normalizeBriefEntry(field, raw);
      if (entry === '') return false;
      if (field === 'links' && !isBriefLink(entry)) {
        toastService.info(t('marketplace.offer.brief.measure.linkError'));
        return false;
      }
      const current = brief[field];
      if (current.includes(entry)) {
        toastService.info(t('marketplace.offer.brief.duplicate'));
        return false;
      }
      if (current.length >= DEAL_BRIEF_LIMITS.maxEntries) {
        toastService.info(t('marketplace.offer.brief.max', { max: DEAL_BRIEF_LIMITS.maxEntries }));
        return false;
      }
      setList(field, [...current, entry]);
      return true;
    },
    [brief, setList, t],
  );

  const removeEntry = useCallback(
    (field: CampaignBriefList, entry: string) => setList(field, brief[field].filter(value => value !== entry)),
    [brief, setList],
  );

  const applyTemplate = useCallback(
    (key: BriefTemplateKey) => {
      const { points, donts } = briefTemplateEntries(t, key);
      edit({
        privateBrief: {
          ...brief,
          talkingPoints: mergeBriefEntries(brief.talkingPoints, points),
          donts: mergeBriefEntries(brief.donts, donts),
        },
      });
    },
    [brief, edit, t],
  );

  const activeTone = useMemo(() => activeBriefTone(t, brief.talkingPoints), [brief.talkingPoints, t]);
  const toggleTone = useCallback(
    (tone: BriefToneKey) => setList('talkingPoints', toggleBriefTone(t, brief.talkingPoints, tone)),
    [brief.talkingPoints, setList, t],
  );

  // — Promo code and tracking link ————————————————————————————————————
  const setPromoCode = useCallback(
    (promoCode: string) => edit({ privateBrief: { ...brief, promoCode } }),
    [brief, edit],
  );
  const setTrackingLink = useCallback(
    (trackingLink: string) => edit({ privateBrief: { ...brief, trackingLink } }),
    [brief, edit],
  );

  // — Files ——————————————————————————————————————————————————————————
  // The picker opens only once the source sheet is gone: iOS can't present over a closing modal.
  const pendingSource = useRef<BriefFileSource | null>(null);
  const openFilesSheet = useCallback(() => setFilesSheet(true), []);
  const closeFilesSheet = useCallback(() => setFilesSheet(false), []);
  const chooseFileSource = useCallback((source: BriefFileSource) => {
    pendingSource.current = source;
    setFilesSheet(false);
  }, []);
  const { pickFrom } = attachments;
  const onFilesSheetDismissed = useCallback(() => {
    const source = pendingSource.current;
    pendingSource.current = null;
    if (source) pickFrom(source);
  }, [pickFrom]);

  // — What the server refused ————————————————————————————————————————
  const refusal = refused.private_brief;
  const promoError = refusal?.fields[PROMO_FIELD];
  const refusedLink = refusal?.fields[TRACKING_FIELD];
  const trackingError =
    brief.trackingLink.trim() !== '' && !isBriefLink(brief.trackingLink.trim())
      ? t('marketplace.offer.brief.measure.linkError')
      : refusedLink;
  const otherFields = Object.entries(refusal?.fields ?? {})
    .filter(([name]) => name !== PROMO_FIELD && name !== TRACKING_FIELD)
    .map(([, message]) => message);
  const briefError = otherFields[0] ?? (refusal && Object.keys(refusal.fields).length === 0 ? refusal.error.message : undefined);

  return {
    brief,
    open,
    openSheet,
    closeSheet,
    addEntry,
    removeEntry,
    applyTemplate,
    activeTone,
    toggleTone,
    setPromoCode,
    setTrackingLink,
    promoMax: DEAL_BRIEF_LIMITS.maxPromoCodeLength,
    trackingMax: DEAL_BRIEF_LIMITS.maxTrackingLinkLength,
    entryCount: listItemCount(brief),
    fileCount: attachments.count,
    fileMax: CAMPAIGN_UPLOAD_LIMIT.brief,
    attachments,
    filesSheet,
    openFilesSheet,
    closeFilesSheet,
    chooseFileSource,
    onFilesSheetDismissed,
    promoError,
    trackingError,
    briefError,
    /** Something in the brief was refused: the row says so even with the sheet closed. */
    refused: refusal !== undefined,
  };
};

export type CampaignBriefModel = ReturnType<typeof useCampaignBrief>;
