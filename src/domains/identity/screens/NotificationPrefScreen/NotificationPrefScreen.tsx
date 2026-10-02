import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Bell, BellRing } from 'lucide-react-native';
import type { PushPermission } from '@/core/notification';
import {
  Box,
  CustomButton,
  Layout,
  LayoutFooter,
  ListGroup,
  ListRow,
  StatusPill,
  Switch,
} from '@/shared/ui';
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

const PUSH_SUBTITLE_KEY = {
  enabled: 'account.notificationPref.push.enabled',
  askable: 'account.notificationPref.push.askable',
  blocked: 'account.notificationPref.push.blocked',
  unavailable: 'account.notificationPref.push.unavailable',
} as const satisfies Record<PushPermission, ParseKeys>;

interface PushStatusRowProps {
  permission: PushPermission | null;
  isRequesting: boolean;
  onEnable: () => void;
  onOpenSettings: () => void;
}

/** The OS permission as a status, not a switch: the app can't turn it off. */
const PushStatusRow: React.FC<PushStatusRowProps> = memo(
  ({ permission, isRequesting, onEnable, onOpenSettings }) => {
    const { t } = useTranslation();
    const trailing =
      permission === 'enabled' ? (
        <StatusPill
          label={t('account.notificationPref.push.on')}
          tone="success"
          icon={BellRing}
          size="sm"
        />
      ) : permission === 'askable' ? (
        <CustomButton
          title={t('account.notificationPref.push.enable')}
          onPress={onEnable}
          variant="secondary"
          size="sm"
          loading={isRequesting}
        />
      ) : permission === 'blocked' ? (
        <CustomButton
          title={t('account.notificationPref.push.openSettings')}
          onPress={onOpenSettings}
          variant="secondary"
          size="sm"
        />
      ) : null;

    return (
      <ListRow
        icon={Bell}
        title={t('account.notificationPref.push.title')}
        subtitle={permission ? t(PUSH_SUBTITLE_KEY[permission]) : undefined}
        trailing={trailing}
        loading={permission === null}
      />
    );
  },
);

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
  const { toggles, setToggle, handleSave, isFetching, isSaving, push } =
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
      <Box gap="2xl">
        <ListGroup>
          <PushStatusRow
            permission={push.permission}
            isRequesting={push.isRequesting}
            onEnable={push.request}
            onOpenSettings={push.openSettings}
          />
        </ListGroup>
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
      </Box>
    </Layout>
  );
};

export const NotificationPrefScreen = memo(NotificationPrefScreenComponent);
