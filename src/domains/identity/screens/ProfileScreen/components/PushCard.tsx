import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BellOff, BellRing } from 'lucide-react-native';
import type { PushPermission } from '@/core/notification';
import { Notice } from '@/shared/ui';

interface PushCardProps {
  permission: PushPermission | null;
  onEnable: () => void;
}

/** Push status: a nudge while off (askable → OS dialog, blocked → Settings), a calm row once on. */
const PushCardComponent: React.FC<PushCardProps> = ({ permission, onEnable }) => {
  const { t } = useTranslation();

  if (permission == null || permission === 'unavailable') return null;

  if (permission === 'enabled') {
    return (
      <Notice
        tone="success"
        icon={BellRing}
        title={t('account.profile.push.onTitle')}
        message={t('account.profile.push.onBody')}
      />
    );
  }

  return (
    <Notice
      tone="warning"
      icon={BellOff}
      title={t('account.profile.push.offTitle')}
      message={t('account.profile.push.offBody')}
      action={{
        label:
          permission === 'blocked'
            ? t('account.profile.push.openSettings')
            : t('account.profile.push.enable'),
        onPress: onEnable,
      }}
    />
  );
};

export const PushCard = memo(PushCardComponent);
