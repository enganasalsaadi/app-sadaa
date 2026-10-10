import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDate } from '@/core/i18n';
import type { SettingsStackParamList } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { useGetKycQuery } from '../../../api/kycApi';
import { useGetDomainVerificationQuery, useGetSocialProofQuery } from '../../../api/verificationApi';
import type { VerificationAttemptCardProps } from '../../../components/VerificationAttemptCard';
import {
  BRAND_KYC_DOCUMENT_LABEL,
  BRAND_KYC_DOCUMENT_TYPES,
  toBrandKycDocumentGroup,
} from '../../../constants/kyc';
import type { VerificationMethod } from '../../../constants/verificationMethods';
import type { KycDetails } from '../../../types/kyc';
import type { DomainVerification, SocialProof } from '../../../types/verification';
import {
  selectActiveAttempts,
  type ActiveVerificationAttempt,
} from '../../../utils/verificationAttempts';

type Navigation = NativeStackNavigationProp<SettingsStackParamList>;

export interface VerificationAttemptView extends VerificationAttemptCardProps {
  key: ActiveVerificationAttempt['kind'];
}

export interface VerifiedView {
  methodLine: string;
  dateLine: string | null;
}

const STATUS_FALLBACK = {
  document: {
    pending: 'account.verification.status.document.pending',
    rejected: 'account.verification.status.document.rejected',
  },
  social: {
    pending: 'account.verification.status.social.pending',
    rejected: 'account.verification.status.social.rejected',
  },
  domain: {
    pending: 'account.verification.status.domain.pending',
    expired: 'account.verification.status.domain.expired',
  },
} as const;

const toDisplayUrl = (url: string): string => url.replace(/^https?:\/\/(www\.)?/i, '');

const documentLabelKey = (documentType: string | null) =>
  BRAND_KYC_DOCUMENT_TYPES.find(known => known === documentType);

/** "Via {method} · {domain | page}" once verified: the server names the route that passed. */
const verifiedDetail = (
  kyc: KycDetails,
  social: SocialProof | null,
  domain: DomainVerification | null,
): string | null => {
  if (kyc.method === 'domain_email' && domain?.status === 'verified') return domain.domain;
  if (kyc.method === 'social_dm_proof' && social?.status === 'approved') {
    return toDisplayUrl(social.pageUrl);
  }
  return null;
};

const verifiedAt = (
  kyc: KycDetails,
  social: SocialProof | null,
  domain: DomainVerification | null,
): string | null => {
  if (kyc.reviewed_at) return kyc.reviewed_at;
  if (kyc.method === 'domain_email') return domain?.verifiedAt ?? null;
  if (kyc.method === 'social_dm_proof') return social?.reviewedAt ?? null;
  return null;
};

/**
 * Brand verification hub (Settings): the four methods, every open attempt above them, or the
 * verified state. Statuses come from the server (`/user/kyc` + the two route GETs); a push
 * invalidates them all.
 */
export const useCompanyVerificationScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const isBrand = useAppSelector(selectUser)?.user_type === 'brand';
  const [refreshing, setRefreshing] = useState(false);

  // Fresh on every open: approvals happen outside the app.
  const kycQuery = useGetKycQuery(undefined, { refetchOnMountOrArgChange: true });
  const socialQuery = useGetSocialProofQuery(undefined, {
    skip: !isBrand,
    refetchOnMountOrArgChange: true,
  });
  const domainQuery = useGetDomainVerificationQuery(undefined, {
    skip: !isBrand,
    refetchOnMountOrArgChange: true,
  });

  const kyc = kycQuery.data ?? null;
  // A failed route GET only hides that route's card; the picker still works.
  const social = socialQuery.data ?? null;
  const domain = domainQuery.data ?? null;

  const openMethod = useCallback(
    (method: VerificationMethod) => {
      switch (method) {
        case 'registry':
          navigation.navigate('KycScreen', { documentGroup: 'company' });
          return;
        case 'ownerId':
          navigation.navigate('KycScreen', { documentGroup: 'owner' });
          return;
        case 'social':
          navigation.navigate('SocialProof');
          return;
        case 'domain':
          navigation.navigate('DomainEmail');
          return;
        default: {
          const _exhaustive: never = method;
          return _exhaustive;
        }
      }
    },
    [navigation],
  );

  const openDocument = useCallback(
    () =>
      navigation.navigate('KycScreen', {
        documentGroup: toBrandKycDocumentGroup(kyc?.document_type ?? null),
      }),
    [navigation, kyc?.document_type],
  );
  const openSocial = useCallback(() => navigation.navigate('SocialProof'), [navigation]);
  const openDomain = useCallback(() => navigation.navigate('DomainEmail'), [navigation]);

  const attempts = useMemo<VerificationAttemptView[]>(() => {
    if (!kyc) return [];
    const failedHint = t('account.verification.picker.active.rejectedHint');
    return selectActiveAttempts(kyc, social, domain, Date.now()).map(attempt => {
      const tone = attempt.state === 'pending' ? 'waiting' : 'failed';
      switch (attempt.kind) {
        case 'document': {
          const known = documentLabelKey(attempt.kyc.document_type);
          return {
            key: 'document',
            tone,
            title:
              attempt.kyc.document_type_label ||
              t(known ? BRAND_KYC_DOCUMENT_LABEL[known] : 'account.kyc.brandTitle'),
            statusLabel: t(STATUS_FALLBACK.document[attempt.state]),
            body:
              attempt.state === 'pending'
                ? t('account.profile.kyc.brand.pendingBody')
                : `${attempt.kyc.rejection_reason || t('account.profile.kyc.brand.rejectedBody')} ${failedHint}`,
            onPress: openDocument,
          };
        }
        case 'social':
          return {
            key: 'social',
            tone,
            title: t('account.verification.picker.active.socialTitle', {
              platform: attempt.proof.platformLabel,
            }),
            statusLabel:
              attempt.proof.statusLabel || t(STATUS_FALLBACK.social[attempt.state]),
            body:
              attempt.state === 'pending'
                ? t('account.verification.picker.active.socialPendingBody', {
                    code: attempt.proof.code,
                  })
                : [attempt.proof.rejectionReason, failedHint].filter(Boolean).join(' '),
            onPress: openSocial,
          };
        case 'domain':
          return {
            key: 'domain',
            tone,
            title: t('account.verification.picker.methods.domain.title'),
            // Expiry spotted on the device before the server flipped it: its label still says pending.
            statusLabel:
              (attempt.attempt.status === attempt.state && attempt.attempt.statusLabel) ||
              t(STATUS_FALLBACK.domain[attempt.state]),
            body:
              attempt.state === 'pending'
                ? t('account.verification.picker.active.domainPendingBody', {
                    email: attempt.attempt.email,
                  })
                : t('account.verification.domain.expired.body'),
            onPress: openDomain,
          };
        default: {
          const _exhaustive: never = attempt;
          return _exhaustive;
        }
      }
    });
  }, [kyc, social, domain, t, openDocument, openSocial, openDomain]);

  const verified = useMemo<VerifiedView | null>(() => {
    if (kyc?.status !== 'verified') return null;
    const detail = verifiedDetail(kyc, social, domain);
    const method = [kyc.method_label, detail].filter(Boolean).join(' · ');
    const at = verifiedAt(kyc, social, domain);
    return {
      methodLine: kyc.method_label
        ? t('account.verification.verified.via', { method })
        : t('account.verification.verified.fallback'),
      dateLine: at
        ? t('account.verification.verified.at', {
            date: formatDate(new Date(at), { dateStyle: 'long' }),
          })
        : null,
    };
  }, [kyc, social, domain, t]);

  // The social row's line says what picking it again does to the open code.
  const hints = useMemo<Partial<Record<VerificationMethod, string>>>(() => {
    if (social?.status === 'pending') {
      return { social: t('account.verification.picker.methods.social.replaceHint') };
    }
    if (social?.status === 'rejected') {
      return { social: t('account.verification.picker.methods.social.retryHint') };
    }
    return {};
  }, [social?.status, t]);

  const { refetch: refetchKyc } = kycQuery;
  const { refetch: refetchSocial } = socialQuery;
  const { refetch: refetchDomain } = domainQuery;
  const refetchAll = useCallback(
    () =>
      Promise.all([
        refetchKyc(),
        isBrand ? refetchSocial() : null,
        isBrand ? refetchDomain() : null,
      ]),
    [isBrand, refetchKyc, refetchSocial, refetchDomain],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const retry = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  return {
    isLoading: kycQuery.isLoading || socialQuery.isLoading || domainQuery.isLoading,
    isError: kycQuery.isError && !kyc,
    loadError: kycQuery.error,
    isRetrying: kycQuery.isFetching,
    retry,
    refreshing,
    onRefresh,
    verified,
    attempts,
    hints,
    onSelect: openMethod,
  };
};

export type CompanyVerificationScreenModel = ReturnType<typeof useCompanyVerificationScreen>;
