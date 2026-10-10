import React, { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import {
  PRICE_LOCK_ACTION,
  PRICE_LOCK_ACTION_FALLBACK,
  type PriceLockReason,
  type PriceLockScreen,
} from '@/domains/identity';

export interface PriceLockSheetProps {
  visible: boolean;
  /** `null` = unknown reason, read as "verify". */
  reason: PriceLockReason | null;
  onClose: () => void;
  /** The reason's CTA, called once the sheet is gone (verification picker, company info). */
  onAction: (screen: PriceLockScreen) => void;
}

/**
 * Why prices (and price filters) are hidden, with the one step that unlocks them. In review
 * or blocked elsewhere → the explanation alone, acknowledged with "Got it".
 */
const PriceLockSheetComponent: React.FC<PriceLockSheetProps> = ({
  visible,
  reason,
  onClose,
  onAction,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const action = reason ? PRICE_LOCK_ACTION[reason] : PRICE_LOCK_ACTION_FALLBACK;
  const { cta } = action;
  const pending = useRef<PriceLockScreen | null>(null);

  const confirm = useCallback(() => {
    pending.current = cta ? cta.screen : null;
    onClose();
  }, [cta, onClose]);

  const dismissed = useCallback(() => {
    const screen = pending.current;
    pending.current = null;
    if (screen) onAction(screen);
  }, [onAction]);

  return (
    <ConfirmSheet
      visible={visible}
      onClose={onClose}
      onDismissed={dismissed}
      icon={<Lock size={sizes.icon.lg} color={colors.interactive.main} />}
      title={t(action.title)}
      body={t(action.body)}
      confirmLabel={t(cta ? cta.label : 'marketplace.priceLock.gotIt')}
      confirmVariant={cta ? 'primary' : 'secondary'}
      onConfirm={confirm}
      cancelLabel={cta ? t('marketplace.priceLock.notNow') : undefined}
    />
  );
};

export const PriceLockSheet = memo(PriceLockSheetComponent);
