import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { normalizeApiError } from '@/core/api';
import { formatDate } from '@/core/i18n';
import { useAppDispatch } from '@/core/store';
import { toastService } from '@/core/toast';
import type { CustomInputHintTone } from '@/shared/ui';
import {
  mediaKitApi,
  useGetMediaKitQuery,
  useUpdateMediaKitMutation,
} from '../../../api/mediaKitApi';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard';
import { useSlugAvailability } from '../../../hooks/useSlugAvailability';
import {
  createMediaKitSlugSchema,
  type MediaKitSlugFormValues,
} from '../../../schemas/mediaKitSlugSchema';
import {
  SLUG_REASON_KEY,
  classifySlugSaveError,
  normalizeSlugInput,
  previewSlugLink,
  resolveSlugCooldown,
} from '../../../utils/mediaKitSlug';

const COOLDOWN_DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

const EMPTY: MediaKitSlugFormValues = { slug: '' };

export type MediaKitSettingsStatus = 'loading' | 'error' | 'ready';

/** Unhandled 4xx only: 403/5xx open the global modals, offline shows the snackbar. */
const shouldToastFailure = (error: unknown): boolean => {
  const { statusCode, isForbidden, isServerError } = normalizeApiError(error);
  return statusCode !== null && !isForbidden && !isServerError;
};

/**
 * Media kit link + visibility (contract §17.2, §17.3). The slug is checked live
 * while typing; during the 30-day cooldown the field stays editable because
 * going back to the previous slug is allowed, and only the server knows it.
 */
export const useMediaKitSettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const schema = useMemo(() => createMediaKitSlugSchema(t), [t]);
  const { data: kit, isError, isFetching, error: loadError, refetch } = useGetMediaKitQuery();
  const [saveSlug, { isLoading: isSaving }] = useUpdateMediaKitMutation();
  const [saveVisibility, { isLoading: isUpdatingVisibility }] = useUpdateMediaKitMutation();
  const [saved, setSaved] = useState(false);
  const [pendingPublic, setPendingPublic] = useState<boolean | null>(null);
  const [hideSheetVisible, setHideSheetVisible] = useState(false);

  const { control, handleSubmit, reset, setError, formState } = useForm<MediaKitSlugFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  const currentSlug = kit?.slug ?? null;

  // Prefill from the server; a refetch never wipes an edit in progress.
  useEffect(() => {
    if (currentSlug !== null && !formState.isDirty) reset({ slug: currentSlug });
  }, [currentSlug, formState.isDirty, reset]);

  const slug = useWatch({ control, name: 'slug' });
  const { availability, recheck } = useSlugAvailability(slug, currentSlug);

  const guard = useDiscardGuard(
    formState.isDirty && currentSlug !== null && slug !== currentSlug && !saved,
  );

  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  const cooldownUntil = useMemo(
    () => (kit ? resolveSlugCooldown(kit.can_change_slug_at, Date.now()) : null),
    [kit],
  );
  const cooldownMessage = cooldownUntil
    ? t('account.mediaKit.settingsScreen.cooldown.message', {
        date: formatDate(cooldownUntil, COOLDOWN_DATE),
      })
    : null;

  /** Live result under the field. A shape problem is a neutral hint until blur/save turns it red. */
  const slugFeedback = useMemo<{ hint?: string; hintTone: CustomInputHintTone; error?: string }>(() => {
    switch (availability.status) {
      case 'unchanged':
        return { hint: t('account.mediaKit.settingsScreen.link.current'), hintTone: 'neutral' };
      case 'checking':
        return { hint: t('account.mediaKit.settingsScreen.link.checking'), hintTone: 'neutral' };
      case 'invalid':
        return { hint: t(SLUG_REASON_KEY[availability.reason]), hintTone: 'neutral' };
      case 'available':
        return {
          hint: t('account.mediaKit.settingsScreen.link.available', {
            link: kit && currentSlug ? previewSlugLink(kit.public_url, currentSlug, slug) : slug,
          }),
          hintTone: 'success',
        };
      case 'unavailable':
        return { error: t(SLUG_REASON_KEY[availability.reason]), hintTone: 'neutral' };
      case 'unknown':
        return { hint: t('account.mediaKit.settingsScreen.link.checkFailed'), hintTone: 'neutral' };
      default: {
        const _exhaustive: never = availability;
        return _exhaustive;
      }
    }
  }, [availability, currentSlug, kit, slug, t]);

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      if (currentSlug === null || isSaving) return;
      if (values.slug === currentSlug) {
        setSaved(true);
        return;
      }
      if (availability.status === 'unavailable') {
        setError('slug', { message: t(SLUG_REASON_KEY[availability.reason]) }, { shouldFocus: true });
        return;
      }
      try {
        await saveSlug({ slug: values.slug }).unwrap();
        toastService.success(t('account.mediaKit.settingsScreen.link.saved'));
        setSaved(true);
      } catch (err) {
        const failure = classifySlugSaveError(err);
        switch (failure.kind) {
          case 'unavailable':
            setError('slug', { message: t(SLUG_REASON_KEY[failure.reason]) }, { shouldFocus: true });
            // A green live check lost a race: refresh it so the hint matches the server.
            if (failure.reason === 'taken') recheck();
            return;
          case 'cooldown':
            setError(
              'slug',
              {
                message: failure.availableAt
                  ? t('account.mediaKit.settingsScreen.cooldown.saveBlocked', {
                      date: formatDate(failure.availableAt, COOLDOWN_DATE),
                    })
                  : t('account.mediaKit.settingsScreen.cooldown.saveBlockedNoDate'),
              },
              { shouldFocus: true },
            );
            return;
          case 'rate_limited':
            toastService.error(t('account.mediaKit.settingsScreen.rateLimited'));
            return;
          case 'failed':
            if (shouldToastFailure(err)) {
              toastService.error(t('account.mediaKit.settingsScreen.link.saveFailed'));
            }
            return;
          default: {
            const _exhaustive: never = failure;
            return _exhaustive;
          }
        }
      }
    })();
  }, [availability, currentSlug, handleSubmit, isSaving, recheck, saveSlug, setError, t]);

  const applyVisibility = useCallback(
    async (isPublic: boolean) => {
      setPendingPublic(isPublic);
      try {
        const updated = await saveVisibility({ is_public: isPublic }).unwrap();
        // Write the PATCH answer straight in, so the switch never flips back while the kit refetches.
        dispatch(mediaKitApi.util.upsertQueryData('getMediaKit', undefined, updated));
        toastService.success(
          t(
            isPublic
              ? 'account.mediaKit.share.madePublic'
              : 'account.mediaKit.settingsScreen.visibility.madeHidden',
          ),
        );
      } catch (err) {
        const { statusCode, code } = normalizeApiError(err);
        if (statusCode === 429 || code === 'too_many_requests') {
          toastService.error(t('account.mediaKit.settingsScreen.rateLimited'));
        } else if (shouldToastFailure(err)) {
          toastService.error(t('account.mediaKit.settingsScreen.visibility.failed'));
        }
      } finally {
        setPendingPublic(null);
      }
    },
    [dispatch, saveVisibility, t],
  );

  const onTogglePublic = useCallback(
    (next: boolean) => {
      if (isUpdatingVisibility) return;
      if (next) {
        applyVisibility(true);
      } else {
        setHideSheetVisible(true);
      }
    },
    [applyVisibility, isUpdatingVisibility],
  );

  const confirmHide = useCallback(() => {
    setHideSheetVisible(false);
    applyVisibility(false);
  }, [applyVisibility]);

  const closeHideSheet = useCallback(() => setHideSheetVisible(false), []);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const status: MediaKitSettingsStatus = kit
    ? 'ready'
    : isError && !isFetching
    ? 'error'
    : 'loading';

  return {
    status,
    loadError,
    onRetry,
    control,
    normalizeSlug: normalizeSlugInput,
    slugFeedback,
    cooldownMessage,
    onSave,
    isSaving,
    isPublic: pendingPublic ?? kit?.is_public ?? true,
    isUpdatingVisibility,
    onTogglePublic,
    hideSheetVisible,
    confirmHide,
    closeHideSheet,
    guard,
  };
};

export type MediaKitSettingsScreenModel = ReturnType<typeof useMediaKitSettingsScreen>;
