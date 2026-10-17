import { useCallback, useMemo, useRef, useState } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { createIdempotentAction, normalizeApiError } from '@/core/api';
import type { IdempotentAction } from '@/core/api';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { getPersistentDeviceId } from '@/core/notification';
import { toastService } from '@/core/toast';
import { useGetPlatformsQuery } from '@/domains/identity';
import { useApplyToCampaignMutation } from '../../../api/creatorCampaignsApi';
import type { CampaignMoneyBreakdown, CreatorCampaignDetail } from '../../../types/campaign';
import {
  BID_MIN,
  BID_STEP,
  PITCH_MAX,
  accountChoices,
  applyFieldErrors,
  applyRefusal,
  bidIssue,
  defaultAccounts,
  defaultBid,
  estimateNet,
  requiredPlatforms,
  type AccountChoice,
  type ApplyRefusal,
  type BidIssue,
} from '../../../utils/campaignApply';

const BID_ISSUE_KEY = {
  empty: 'marketplace.campaign.apply.bid.empty',
  low: 'marketplace.campaign.apply.bid.low',
  high: 'marketplace.campaign.apply.bid.high',
} as const satisfies Record<BidIssue, ParseKeys>;

export interface ApplyPlatform {
  key: string;
  label: string;
  choices: AccountChoice[];
  selectedId: string | null;
  error: string | null;
}

/**
 * The apply sheet's whole state (PC5.1): the bid, one account per required platform, the pitch, the
 * consent, and the signature. The hold always runs, so an unfinished form answers with what is
 * missing instead of a dead button; the server's 422 lands on its field, the rest as a banner. One
 * idempotency key lives as long as the filled-in form stays the same, so a retry is never a second
 * application.
 */
export interface ApplyExits {
  /** The gender gap: personal info. */
  openProfile: () => void;
  /** A platform without an account: the linked accounts. */
  openPlatforms: () => void;
}

export const useCampaignApply = (campaign: CreatorCampaignDetail | null, { openProfile, openPlatforms }: ApplyExits) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [requested, setRequested] = useState(false);
  const [bidDraft, setBidDraft] = useState<Money | null | undefined>(undefined);
  const [pitch, setPitchText] = useState('');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [bidProblem, setBidProblem] = useState<BidIssue | null>(null);
  const [serverBidError, setServerBidError] = useState<string | null>(null);
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [consentMissing, setConsentMissing] = useState(false);
  const [banner, setBanner] = useState<ApplyRefusal | null>(null);
  const [apply] = useApplyToCampaignMutation();
  const intentRef = useRef<{ signature: string; action: IdempotentAction } | null>(null);
  const sendingRef = useRef(false);

  const platformsQuery = useGetPlatformsQuery(undefined, { skip: !requested });
  const refetchPlatforms = platformsQuery.refetch;

  const bidRange = campaign?.pricing.bid ?? null;
  const max = bidRange?.max.gross ?? null;
  const isBid = bidRange !== null;
  const feeBps = campaign?.pricing.feeBps ?? 0;
  const bid: Money | null = useMemo(() => {
    if (!bidRange) return null;
    return bidDraft === undefined ? defaultBid(bidRange.min.gross, bidRange.max.gross) : bidDraft;
  }, [bidDraft, bidRange]);

  const issue = isBid && max ? bidIssue(bid, max) : null;
  const net: CampaignMoneyBreakdown | null = useMemo(
    () => (isBid && bid && !issue ? estimateNet(bid, feeBps) : null),
    [bid, feeBps, isBid, issue],
  );

  const minFollowers = campaign?.requirements.minFollowers ?? null;
  const required = useMemo(() => (campaign ? requiredPlatforms(campaign.deliverables) : []), [campaign]);
  const linked = platformsQuery.data;
  const defaults = useMemo(
    () => (linked ? defaultAccounts(required, linked, minFollowers) : {}),
    [linked, minFollowers, required],
  );
  const selected = useMemo(() => ({ ...defaults, ...picks }), [defaults, picks]);

  const platforms = useMemo<ApplyPlatform[]>(
    () =>
      required.map(({ key, label }) => ({
        key,
        label,
        choices: linked ? accountChoices(key, linked, minFollowers) : [],
        selectedId: selected[key] ?? null,
        error: accountErrors[key] ?? null,
      })),
    [accountErrors, linked, minFollowers, required, selected],
  );

  const setBid = useCallback((next: Money | null) => {
    setBidDraft(next);
    setBidProblem(null);
    setServerBidError(null);
  }, []);
  const stepBid = useCallback(
    (direction: 1 | -1) => {
      if (!max) return;
      const from = bid?.amount ?? BID_MIN.amount;
      const amount = Math.min(max.amount, Math.max(BID_MIN.amount, from + direction * BID_STEP));
      setBid({ amount, currency: max.currency });
    },
    [bid, max, setBid],
  );
  const setPitch = useCallback((text: string) => setPitchText(text.slice(0, PITCH_MAX)), []);
  const pickAccount = useCallback((platform: string, accountId: string) => {
    setPicks(current => ({ ...current, [platform]: accountId }));
    setAccountErrors(current => {
      if (!(platform in current)) return current;
      return Object.fromEntries(Object.entries(current).filter(([key]) => key !== platform));
    });
  }, []);
  const toggleConsent = useCallback(() => {
    setConsent(current => !current);
    setConsentMissing(false);
  }, []);

  const open = useCallback(() => {
    setBanner(null);
    setVisible(true);
    // Accounts linked or fixed since the last time are read again; the first open fetches them.
    if (requested) refetchPlatforms();
    else setRequested(true);
  }, [refetchPlatforms, requested]);
  const close = useCallback(() => setVisible(false), []);
  const retryPlatforms = useCallback(() => {
    refetchPlatforms();
  }, [refetchPlatforms]);
  // Leaving for another screen closes the sheet first; the draft stays for the way back.
  const leaveTo = useCallback((go: () => void) => () => {
    setVisible(false);
    go();
  }, []);
  const openProfileFromBanner = useMemo(() => leaveTo(openProfile), [leaveTo, openProfile]);
  const linkPlatform = useMemo(() => leaveTo(openPlatforms), [leaveTo, openPlatforms]);

  const sign = useCallback(async (): Promise<boolean> => {
    if (!campaign || sendingRef.current) return false;
    const problem = isBid && max ? bidIssue(bid, max) : null;
    const missing = required.filter(({ key }) => !selected[key]);
    setBidProblem(problem);
    setAccountErrors(Object.fromEntries(missing.map(({ key }) => [key, t('marketplace.campaign.apply.accounts.required')])));
    setConsentMissing(!consent);
    if (problem || missing.length > 0 || !consent) return false;

    const accounts = Object.fromEntries(required.map(({ key }) => [key, selected[key] ?? '']));
    const signature = JSON.stringify([bid, pitch.trim(), accounts]);
    if (intentRef.current?.signature !== signature) {
      intentRef.current = { signature, action: createIdempotentAction() };
    }
    const { action } = intentRef.current;
    sendingRef.current = true;
    setBanner(null);
    try {
      const deviceId = await getPersistentDeviceId();
      await action.run(idempotencyKey =>
        apply({ id: campaign.id, pitch, bid: isBid ? bid : null, accounts, deviceId, idempotencyKey }).unwrap(),
      );
      intentRef.current = null;
      setVisible(false);
      toastService.success(t('marketplace.campaign.apply.sent'));
      return true;
    } catch (err) {
      const error = normalizeApiError(err);
      const fields = applyFieldErrors(err);
      if (fields) {
        setServerBidError(fields.bid);
        setAccountErrors(fields.accounts);
        return false;
      }
      const refusal = applyRefusal(error);
      if (refusal.kind === 'closed') {
        setVisible(false);
        toastService.error(refusal.message);
      } else {
        setBanner(refusal);
      }
      return false;
    } finally {
      sendingRef.current = false;
    }
  }, [apply, bid, campaign, consent, isBid, max, pitch, required, selected, t]);

  const bidError =
    serverBidError ??
    (bidProblem
      ? t(BID_ISSUE_KEY[bidProblem], {
          min: formatMoney(BID_MIN, i18n.language),
          max: max ? formatMoney(max, i18n.language) : '',
        })
      : null);

  return {
    visible,
    open,
    close,
    isBid,
    bid,
    max,
    suggested: bidRange?.min.gross ?? null,
    feeBps,
    net,
    bidError,
    setBid,
    stepBid,
    pitch,
    setPitch,
    platforms,
    platformsLoading: requested && platformsQuery.isLoading,
    platformsFailed: platformsQuery.isError,
    retryPlatforms,
    pickAccount,
    consent,
    consentMissing,
    toggleConsent,
    banner,
    openProfile: openProfileFromBanner,
    linkPlatform,
    sign,
  };
};

export type CampaignApplyModel = ReturnType<typeof useCampaignApply>;
