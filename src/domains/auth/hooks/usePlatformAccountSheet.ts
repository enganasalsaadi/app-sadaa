import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import type { ChipGroupItem } from '@/shared/ui';
import { PLATFORM_LABEL_KEY } from '../constants/socialPlatforms';
import {
  createPlatformAccountSchema,
  isFollowerTier,
  isInfluencerPlatform,
  toHandle,
} from '../schemas';
import type {
  InfluencerPlatform,
  PlatformAccountDraft,
  PlatformAccountFormValues,
} from '../schemas';
import { useSocialLookup } from './useSocialLookup';

const EMPTY: PlatformAccountDraft = {
  platform: '',
  handle: '',
  followerTier: '',
  tierSource: 'manual',
  isPrimary: false,
};

/**
 * `pending`: the handle still needs a lookup (Add runs it) · `locked`: a found
 * lookup set the tier · `manual`: the user picks the tier, admin reviews it.
 */
export type TierMode = 'pending' | 'locked' | 'manual';

interface PlatformAccountSheetConfig {
  visible: boolean;
  /** Set when editing an existing account. */
  initial: PlatformAccountFormValues | null;
  /** Platforms not linked yet (plus the one being edited). */
  platforms: readonly InfluencerPlatform[];
  /** `/lookups` `supports_lookup`: server-driven, never hardcoded. */
  supportsLookup: (platform: InfluencerPlatform) => boolean;
  onSave: (account: PlatformAccountFormValues) => void;
}

export const usePlatformAccountSheet = ({
  visible,
  initial,
  platforms,
  supportsLookup,
  onSave,
}: PlatformAccountSheetConfig) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createPlatformAccountSchema(t), [t]);
  const lookup = useSocialLookup();
  const { reset: resetLookup, check } = lookup;

  const { control, handleSubmit, reset, setValue, getValues, trigger, clearErrors } =
    useForm<PlatformAccountDraft>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY,
    });
  const platform = useWatch({ control, name: 'platform' });
  const followerTier = useWatch({ control, name: 'followerTier' });
  const canLookup = isInfluencerPlatform(platform) && supportsLookup(platform);

  const [tierMode, setTierModeState] = useState<TierMode>('pending');
  // The handle the current tier mode belongs to: editing it away re-opens the lookup.
  const [anchorHandle, setAnchorHandle] = useState<string | null>(null);

  const setTierMode = useCallback(
    (mode: TierMode) => {
      setTierModeState(mode);
      setValue('tierSource', mode === 'locked' ? 'auto' : 'manual');
    },
    [setValue],
  );

  // Read through a ref: `/lookups` landing mid-edit must not reset the form below.
  const supportsLookupRef = useRef(supportsLookup);
  supportsLookupRef.current = supportsLookup;
  const modeFor = useCallback(
    (value: string): TierMode =>
      isInfluencerPlatform(value) && !supportsLookupRef.current(value) ? 'manual' : 'pending',
    [],
  );

  // Fresh form on every open; the only platform left is preselected.
  useEffect(() => {
    if (!visible) {
      resetLookup();
      return;
    }
    const only = platforms.length === 1 ? platforms[0] : undefined;
    const draft: PlatformAccountDraft = initial
      ? { ...initial, followerTier: initial.followerTier ?? '' }
      : { ...EMPTY, platform: only ?? '' };
    reset(draft);
    resetLookup();
    setTierModeState(
      initial ? (initial.tierSource === 'auto' ? 'locked' : 'manual') : modeFor(draft.platform),
    );
    setAnchorHandle(initial?.handle ?? null);
  }, [initial, modeFor, platforms, reset, resetLookup, visible]);

  const platformItems = useMemo<ChipGroupItem[]>(
    () => platforms.map(value => ({ value, label: t(PLATFORM_LABEL_KEY[value]) })),
    [platforms, t],
  );

  const invalidate = useCallback(
    (nextPlatform: string) => {
      resetLookup();
      setAnchorHandle(null);
      if (getValues('tierSource') === 'auto') setValue('followerTier', '');
      setTierMode(modeFor(nextPlatform));
    },
    [getValues, modeFor, resetLookup, setTierMode, setValue],
  );

  const onPlatformChange = useCallback(
    (next: string) => {
      setValue('platform', next, { shouldValidate: true });
      invalidate(next);
    },
    [invalidate, setValue],
  );

  /** Call after the input's own `onChange`. */
  const onHandleEdited = useCallback(
    (text: string) => {
      if (anchorHandle !== null && toHandle(text) !== anchorHandle) {
        invalidate(getValues('platform'));
      }
    },
    [anchorHandle, getValues, invalidate],
  );

  const { throttleSeconds } = lookup;
  const onCheck = useCallback(async () => {
    // The keyboard's search key bypasses the disabled Check button.
    if (throttleSeconds > 0) return;
    if (!(await trigger(['platform', 'handle']))) return;
    const values = getValues();
    if (!isInfluencerPlatform(values.platform)) return;
    // The server parses links and `@` itself; send what was typed.
    const typed = values.handle.trim();
    setAnchorHandle(toHandle(typed));
    const outcome = await check(values.platform, typed);
    if (!outcome) return;
    switch (outcome.kind) {
      case 'found':
        setValue('handle', outcome.profile.username);
        setAnchorHandle(outcome.profile.username);
        setValue('followerTier', outcome.profile.follower_tier ?? '');
        clearErrors('followerTier');
        setTierMode('locked');
        return;
      case 'claimed':
      case 'invalid':
        setTierMode('pending');
        return;
      case 'notFound':
      case 'unavailable':
      case 'manual':
      case 'throttled':
        if (getValues('tierSource') === 'auto') setValue('followerTier', '');
        setTierMode('manual');
        return;
    }
  }, [check, clearErrors, getValues, setTierMode, setValue, throttleSeconds, trigger]);

  const lookupKind = lookup.state.kind;
  const onSubmit = useCallback(() => {
    // Their error sits under the handle until it is edited; re-checking can't change it.
    if (lookupKind === 'checking' || lookupKind === 'claimed' || lookupKind === 'invalid') return;
    // Add on an unchecked handle runs the lookup first; the user confirms the result.
    if (canLookup && tierMode === 'pending') {
      onCheck();
      return;
    }
    handleSubmit(values => {
      // Already enforced by the schema; narrows the draft's strings.
      if (!isInfluencerPlatform(values.platform)) return;
      const tier = isFollowerTier(values.followerTier) ? values.followerTier : null;
      if (values.tierSource === 'manual' && tier === null) return;
      onSave({
        platform: values.platform,
        handle: toHandle(values.handle),
        followerTier: tier,
        tierSource: values.tierSource,
        isPrimary: values.isPrimary,
      });
    })();
  }, [canLookup, handleSubmit, lookupKind, onCheck, onSave, tierMode]);

  const { state } = lookup;
  const handleError =
    state.kind === 'claimed'
      ? t('auth.influencerOnboarding.socials.lookup.claimed')
      : state.kind === 'notFound'
      ? t('auth.influencerOnboarding.socials.lookup.notFound')
      : state.kind === 'invalid'
      ? state.message
      : undefined;

  return {
    control,
    platformItems,
    onPlatformChange,
    onHandleEdited,
    onSubmit,
    isEditing: initial !== null,
    canLookup,
    onCheck,
    isChecking: state.kind === 'checking',
    /** Seconds until Check works again after a 429. */
    throttleSeconds,
    lookupKind: state.kind,
    foundProfile: state.kind === 'found' ? state.profile : null,
    handleError,
    tierMode,
    lockedTier: tierMode === 'locked' && isFollowerTier(followerTier) ? followerTier : null,
  };
};
