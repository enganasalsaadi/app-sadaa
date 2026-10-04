import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Zap } from 'lucide-react-native';
import { ListGroup, ListRow, Switch } from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';

interface PlatformSettingsGroupProps {
  platform: PlatformResource;
  onToggleAvailable: (next: boolean) => void;
  isSettingAvailability: boolean;
  onMakePrimary: () => void;
  isSettingPrimary: boolean;
  /** `false` for rejected accounts (409 `platform_not_eligible_for_primary`). */
  canMakePrimary: boolean;
}

/** Both switches save at once; the primary one can only be turned on (another page turns it off). */
const PlatformSettingsGroupComponent: React.FC<PlatformSettingsGroupProps> = ({
  platform,
  onToggleAvailable,
  isSettingAvailability,
  onMakePrimary,
  isSettingPrimary,
  canMakePrimary,
}) => {
  const { t } = useTranslation();

  return (
    <ListGroup>
      <ListRow
        icon={Zap}
        title={t('account.platforms.available')}
        subtitle={t('account.platforms.availableHint')}
        trailing={
          <Switch
            value={platform.is_available}
            onValueChange={onToggleAvailable}
            disabled={isSettingAvailability}
            accessibilityLabel={t('account.platforms.available')}
          />
        }
      />
      {canMakePrimary ? (
        <ListRow
          icon={Star}
          title={t('account.platforms.makePrimary')}
          subtitle={
            platform.is_primary
              ? t('account.platforms.isPrimaryHint')
              : t('account.platforms.makePrimaryHint')
          }
          trailing={
            <Switch
              value={platform.is_primary}
              onValueChange={onMakePrimary}
              disabled={platform.is_primary || isSettingPrimary}
              accessibilityLabel={t('account.platforms.makePrimary')}
            />
          }
        />
      ) : null}
    </ListGroup>
  );
};

export const PlatformSettingsGroup = memo(PlatformSettingsGroupComponent);
