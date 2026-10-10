import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { formatDate } from '@/core/i18n';
import { useToast } from '@/core/toast';
import { formatClock, useOpenSupport } from '@/domains/auth';
import type { TimelineStep } from '@/shared/ui';
import {
  useGetSocialProofQuery,
  useStartSocialProofMutation,
} from '../../../api/verificationApi';
import type { VerificationFlow } from '../../../hooks/useVerificationFlow';
import {
  SOCIAL_PROOF_PLATFORM_LABEL,
  SOCIAL_PROOF_POLL_MS,
  SOCIAL_PROOF_URL_EXAMPLE,
} from '../../../constants/verification';
import {
  createSocialProofSchema,
  toStartSocialProofRequest,
  type SocialProofFormValues,
} from '../../../schemas/socialProofSchema';
import type {
  SocialProof,
  SocialProofPlatform,
} from '../../../types/verification';
import {
  resolveSocialProofLink,
  type SocialProofLinkKind,
} from '../../../utils/socialProofLink';

export type SocialProofMode =
  | 'loading'
  | 'error'
  | 'form'
  | 'code'
  | 'rejected';

/** Used when a 429 carries no `retry_after` (the limit is 5 starts per hour). */
const FALLBACK_RETRY_SECONDS = 60 * 60;

const SERVER_FIELDS = { platform: 'platform', page_url: 'pageUrl' } as const;

const LINK_COPY = {
  instagram: {
    first: 'account.verification.social.code.stepCopy',
    send: 'account.verification.social.code.stepSendInstagram',
    notice: 'account.verification.social.code.noticeInstagram',
    primary: 'account.verification.social.code.openInstagram',
  },
  facebook: {
    first: 'account.verification.social.code.stepPrefilled',
    send: 'account.verification.social.code.stepSendFacebook',
    notice: 'account.verification.social.code.noticeFacebook',
    primary: 'account.verification.social.code.sendMessenger',
  },
  none: {
    first: 'account.verification.social.code.stepCopy',
    send: 'account.verification.social.code.stepSendFallback',
    notice: 'account.verification.social.code.noticeFallback',
    primary: 'account.verification.social.code.openApp',
  },
} as const satisfies Record<SocialProofLinkKind, Record<string, string>>;

const STATUS_FALLBACK = {
  pending: 'account.verification.status.social.pending',
  approved: 'account.verification.status.social.approved',
  rejected: 'account.verification.status.social.rejected',
} as const;

const toDisplayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '');

const formDefaults = (proof: SocialProof | null): SocialProofFormValues => ({
  platform: proof?.platform ?? 'instagram',
  pageUrl: proof ? toDisplayUrl(proof.pageUrl) : '',
});

/**
 * Social page proof (route 2): page form → code to DM from the store's page → an admin
 * matches it by hand. Pending is polled while focused (focus + 60 s); approval or rejection
 * also arrives by push, which invalidates the same cache.
 */
export const useSocialProofScreen = (flow: VerificationFlow) => {
  const { t } = useTranslation();
  const toast = useToast();
  const openSupport = useOpenSupport();
  const isFocused = useIsFocused();

  const [editing, setEditing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const waitSeconds = useCountdown(retryUntil);

  const query = useGetSocialProofQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const proof = query.data ?? null;
  const isPending = proof?.status === 'pending';
  const showForm = editing || !proof;

  // Second subscription on the same cache entry: polls only while a pending code is on screen.
  const polling = isFocused && isPending && !editing;
  useGetSocialProofQuery(undefined, {
    skip: !polling,
    pollingInterval: SOCIAL_PROOF_POLL_MS,
  });

  // The mount already fetches; later focuses (back from Instagram, another tab) refetch.
  const { refetch } = query;
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refetch();
      focusedOnce.current = true;
    }, [refetch]),
  );

  // Approved while open: leave once (settings → picker, wizard → next step).
  const approved = proof?.status === 'approved';
  const { onVerified } = flow;
  const verifiedHandled = useRef(false);
  useEffect(() => {
    if (!approved || verifiedHandled.current) return;
    verifiedHandled.current = true;
    onVerified();
  }, [approved, onVerified]);

  const schema = useMemo(() => createSocialProofSchema(t), [t]);
  const form = useForm<SocialProofFormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: formDefaults(proof),
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    getFieldState,
    trigger,
    formState,
  } = form;

  // The form follows the latest proof until the user starts typing.
  useEffect(() => {
    if (!editing && !formState.isDirty) reset(formDefaults(proof));
  }, [proof, editing, formState.isDirty, reset]);

  const onPlatformChange = useCallback(
    (platform: SocialProofPlatform) => {
      setValue('platform', platform, { shouldDirty: true });
      if (getFieldState('pageUrl').isTouched) trigger('pageUrl');
    },
    [setValue, getFieldState, trigger],
  );

  const startEditing = useCallback(() => {
    reset(formDefaults(proof));
    setEditing(true);
  }, [proof, reset]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    reset(formDefaults(proof));
  }, [proof, reset]);

  // Back from the edit form returns to the code, not out of the screen.
  const canCancelEdit = editing && proof !== null;
  useFocusEffect(
    useCallback(() => {
      if (!canCancelEdit) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        cancelEditing();
        return true;
      });
      return () => sub.remove();
    }, [canCancelEdit, cancelEditing]),
  );
  const { leave } = flow;
  const onBack = useCallback(() => {
    if (canCancelEdit) cancelEditing();
    else leave();
  }, [canCancelEdit, cancelEditing, leave]);

  const [startSocialProof, { isLoading: isStarting }] =
    useStartSocialProofMutation();

  const start = useCallback(
    async (values: SocialProofFormValues) => {
      setConfirmVisible(false);
      try {
        await startSocialProof(toStartSocialProofRequest(values)).unwrap();
        setEditing(false);
        toast.success(t('account.verification.social.toastCreated'));
      } catch (err) {
        const apiError = normalizeApiError(err);
        if (apiError.statusCode === 422) {
          // baseQuery already toasted it; pin the message to its field.
          applyServerFieldErrors(err, SERVER_FIELDS, setError);
          return;
        }
        if (apiError.code === 'kyc_already_verified') {
          toast.info(t('account.verification.errors.alreadyVerified'));
          onVerified();
          return;
        }
        if (apiError.statusCode === 429) {
          setRetryUntil(
            Date.now() + (apiError.retryAfter ?? FALLBACK_RETRY_SECONDS) * 1000,
          );
          return;
        }
        // 403/5xx open the global modals; offline shows the snackbar.
        if (
          !apiError.isForbidden &&
          !apiError.isServerError &&
          apiError.statusCode !== null
        ) {
          toast.error(t('errors.generic'));
        }
      }
    },
    [startSocialProof, setError, toast, t, onVerified],
  );

  // A pending code stops working once replaced: confirm first.
  const onSubmit = useCallback(() => {
    if (waitSeconds > 0 || isStarting) return;
    handleSubmit(values => {
      if (isPending) setConfirmVisible(true);
      else start(values);
    })();
  }, [handleSubmit, waitSeconds, isStarting, isPending, start]);
  const onConfirmReplace = useCallback(() => {
    handleSubmit(start)();
  }, [handleSubmit, start]);
  const closeConfirm = useCallback(() => setConfirmVisible(false), []);

  const link = useMemo(
    () => (proof ? resolveSocialProofLink(proof) : null),
    [proof],
  );
  const platformName = proof
    ? proof.platformLabel ||
      (proof.platform ? t(SOCIAL_PROOF_PLATFORM_LABEL[proof.platform]) : '')
    : '';

  const copyCode = useCallback(() => {
    if (!proof) return;
    Clipboard.setString(proof.code);
    toast.success(t('account.verification.social.code.copied'));
  }, [proof, t, toast]);

  const openPlatform = useCallback(async () => {
    if (!proof || !link) return;
    // Instagram can't prefill a DM: the code goes to the clipboard on the way out.
    if (link.kind !== 'facebook') copyCode();
    if (!link.url) {
      toast.error(t('account.verification.social.code.openFailed'));
      return;
    }
    await Linking.openURL(link.url).catch(() =>
      toast.error(t('account.verification.social.code.openFailed')),
    );
  }, [proof, link, copyCode, toast, t]);

  const contactSupport = useCallback(() => {
    if (proof)
      openSupport(
        t('account.verification.social.code.supportMessage', {
          code: proof.code,
        }),
      );
  }, [proof, openSupport, t]);

  const steps = useMemo<TimelineStep[]>(() => {
    if (!link) return [];
    const copy = LINK_COPY[link.kind];
    return [
      { key: 'copy', title: t(copy.first), state: 'done' },
      {
        key: 'send',
        title: t(copy.send, { platform: platformName }),
        caption: t('account.verification.social.code.stepFromStore'),
        state: 'current',
      },
      {
        key: 'review',
        title: t('account.verification.social.code.stepReview'),
        state: 'upcoming',
      },
    ];
  }, [link, platformName, t]);

  const howSteps = useMemo<TimelineStep[]>(
    () => [
      {
        key: 'code',
        title: t('account.verification.social.form.how1'),
        state: 'upcoming',
      },
      {
        key: 'send',
        title: t('account.verification.social.form.how2'),
        state: 'upcoming',
      },
      {
        key: 'review',
        title: t('account.verification.social.form.how3'),
        state: 'upcoming',
      },
    ],
    [t],
  );

  const mode: SocialProofMode = query.isLoading
    ? 'loading'
    : query.isError && query.data === undefined
    ? 'error'
    : showForm
    ? 'form'
    : proof?.status === 'rejected'
    ? 'rejected'
    : 'code';

  const statusLabel =
    proof?.statusLabel ||
    (proof?.status ? t(STATUS_FALLBACK[proof.status]) : '');
  const linkCopy = link ? LINK_COPY[link.kind] : LINK_COPY.none;

  return {
    mode,
    onBack,
    loadError: query.error,
    retry: refetch,
    isRetrying: query.isFetching,
    form: {
      control,
      onPlatformChange,
      urlExample: (platform: SocialProofPlatform) =>
        t('account.verification.social.form.urlExample', {
          example: SOCIAL_PROOF_URL_EXAMPLE[platform],
        }),
      howSteps,
      onSubmit,
      isSubmitting: isStarting,
      isRateLimited: waitSeconds > 0,
      submitLabel:
        waitSeconds > 0
          ? t('account.kyc.retryIn', { time: formatClock(waitSeconds) })
          : t('account.verification.social.form.submit'),
    },
    confirm: {
      visible: confirmVisible,
      body: proof
        ? t('account.verification.social.code.replaceBody', {
            code: proof.code,
          })
        : '',
      onConfirm: onConfirmReplace,
      onClose: closeConfirm,
      loading: isStarting,
    },
    code: proof
      ? {
          code: proof.code,
          pageUrl: proof.pageUrl,
          statusLabel,
          createdAt: t('account.verification.social.code.createdAt', {
            date: formatDate(new Date(proof.createdAt), {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
          }),
          steps,
          notice: t(linkCopy.notice),
          showSupport: link?.kind === 'none',
          primaryLabel: t(linkCopy.primary, { platform: platformName }),
          onCopy: copyCode,
          onOpen: openPlatform,
          onContactSupport: contactSupport,
          onChange: startEditing,
        }
      : null,
    rejected:
      proof?.status === 'rejected'
        ? {
            statusLabel,
            reason: proof.rejectionReason,
            page: toDisplayUrl(proof.pageUrl),
            reviewedAt: proof.reviewedAt
              ? formatDate(new Date(proof.reviewedAt), { dateStyle: 'long' })
              : null,
            onRetry: startEditing,
            onPickOther: flow.pickOther,
          }
        : null,
  };
};

export type SocialProofScreenModel = ReturnType<typeof useSocialProofScreen>;
export type SocialProofFormModel = SocialProofScreenModel['form'];
export type SocialProofCodeModel = NonNullable<SocialProofScreenModel['code']>;
export type SocialProofRejectedModel = NonNullable<
  SocialProofScreenModel['rejected']
>;
