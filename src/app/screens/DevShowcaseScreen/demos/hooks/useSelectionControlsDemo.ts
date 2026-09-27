import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { RadioGroupItem } from '@/shared/ui';

const PLATFORMS = ['instagram', 'tiktok', 'youtube'] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_KEY = {
  instagram: 'devShowcase.selection.instagram',
  tiktok: 'devShowcase.selection.tiktok',
  youtube: 'devShowcase.selection.youtube',
} as const satisfies Record<Platform, ParseKeys>;

type PayoutMethod = 'wallet' | 'cash' | 'bank';

export const useSelectionControlsDemo = () => {
  const { t } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [terms, setTerms] = useState(false);
  const [platforms, setPlatforms] = useState<ReadonlySet<Platform>>(
    () => new Set<Platform>(['instagram']),
  );
  const [payout, setPayout] = useState<PayoutMethod>('wallet');

  const platformItems = useMemo(
    () => PLATFORMS.map(value => ({ value, label: t(PLATFORM_KEY[value]) })),
    [t],
  );

  const togglePlatform = useCallback((value: Platform, checked: boolean) => {
    setPlatforms(prev => {
      const next = new Set(prev);
      if (checked) next.add(value);
      else next.delete(value);
      return next;
    });
  }, []);

  const setAllPlatforms = useCallback(
    (checked: boolean) => setPlatforms(checked ? new Set(PLATFORMS) : new Set()),
    [],
  );

  const allChecked = platforms.size === PLATFORMS.length;
  const someChecked = platforms.size > 0 && !allChecked;

  const payoutItems = useMemo<RadioGroupItem<PayoutMethod>[]>(
    () => [
      {
        value: 'wallet',
        label: t('devShowcase.selection.wallet'),
        description: t('devShowcase.selection.walletDescription'),
      },
      {
        value: 'cash',
        label: t('devShowcase.selection.cash'),
        description: t('devShowcase.selection.cashDescription'),
      },
      {
        value: 'bank',
        label: t('devShowcase.selection.bank'),
        description: t('devShowcase.selection.bankDescription'),
        disabled: true,
      },
    ],
    [t],
  );

  return {
    pushEnabled,
    setPushEnabled,
    emailEnabled,
    setEmailEnabled,
    terms,
    setTerms,
    platforms,
    platformItems,
    togglePlatform,
    setAllPlatforms,
    allChecked,
    someChecked,
    payout,
    setPayout,
    payoutItems,
  };
};
