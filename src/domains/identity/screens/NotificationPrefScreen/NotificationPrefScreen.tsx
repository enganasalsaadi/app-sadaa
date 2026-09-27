import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Layout, LayoutFooter, ListGroup, ListRow, Switch } from '@/shared/ui';
import { useNotificationPref } from './hooks/useNotificationPref';
import type { NotificationToggles } from './hooks/useNotificationPref';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';

type NotificationKey = keyof NotificationToggles;

const LABEL_KEY = {
  booking_confirmations: 'account.notificationPref.booking_confirmations',
  booking_reminders: 'account.notificationPref.booking_reminders',
  review_requests: 'account.notificationPref.review_requests',
  promotions: 'account.notificationPref.promotions',
} as const satisfies Record<NotificationKey, ParseKeys>;

const NOTIFICATION_KEYS = Object.keys(LABEL_KEY) as NotificationKey[];

interface ToggleRowProps {
  toggleKey: NotificationKey;
  value: boolean;
  disabled: boolean;
  onToggle: (key: NotificationKey, value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = memo(
  ({ toggleKey, value, disabled, onToggle }) => {
    const { t } = useTranslation();
    const label = t(LABEL_KEY[toggleKey]);
    const handleChange = useCallback(
      (next: boolean) => onToggle(toggleKey, next),
      [onToggle, toggleKey],
    );
    return (
      <ListRow
        title={label}
        trailing={
          <Switch
            value={value}
            onValueChange={handleChange}
            accessibilityLabel={label}
            disabled={disabled}
          />
        }
      />
    );
  },
);

const NotificationPrefScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { toggles, setToggle, handleSave, isFetching, isSaving } =
    useNotificationPref();

  useHideBottomBar();
  return (
    <Layout
      padding={{ x: '2xl' }}
      header={{ title: t('account.notificationPref.title') }}
      footer={
        <LayoutFooter
          primary={{
            label: t('account.notificationPref.save'),
            onPress: handleSave,
            loading: isSaving,
            disabled: isFetching,
          }}
        />
      }
    >
      <ListGroup>
        {NOTIFICATION_KEYS.map(key => (
          <ToggleRow
            key={key}
            toggleKey={key}
            value={toggles[key]}
            disabled={isFetching}
            onToggle={setToggle}
          />
        ))}
      </ListGroup>
    </Layout>
  );
};

export const NotificationPrefScreen = memo(NotificationPrefScreenComponent);
