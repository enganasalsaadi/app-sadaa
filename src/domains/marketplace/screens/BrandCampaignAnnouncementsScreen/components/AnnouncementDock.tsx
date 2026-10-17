import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Megaphone } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import type { Timestamp } from '../../../types/deal';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

const LOCKED_HEIGHT = moderateScale(56);

export interface AnnouncementDockProps {
  /** The cap is reached until then; `null` while a broadcast is free. */
  unlocksAt: Timestamp | null;
  /** Resolves when the call is answered; the hold frees itself either way. */
  onSend: () => Promise<void>;
}

/** The docked bar: press and hold to broadcast (it can't be taken back), or the time it opens again. */
const AnnouncementDockComponent: React.FC<AnnouncementDockProps> = ({ unlocksAt, onSend }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box px="xl" py="sm">
      {unlocksAt !== null ? (
        <Box
          row
          align="center"
          justify="center"
          gap="sm"
          height={LOCKED_HEIGHT}
          borderRadius="lg"
          bg={colors.surface.elevated}
        >
          <Lock size={sizes.icon.sm} color={colors.text.tertiary} />
          <Text variant="bodyMedium" color={colors.text.tertiary}>
            {t('marketplace.campaign.announcements.lock.dock', { time: formatCampaignDateTime(unlocksAt) })}
          </Text>
        </Box>
      ) : (
        <DealHoldToSign
          label={t('marketplace.campaign.announcements.dock.hold')}
          caption={t('marketplace.campaign.announcements.dock.caption')}
          hint={t('marketplace.campaign.announcements.dock.hint')}
          accessibilityLabel={t('marketplace.campaign.announcements.dock.hold')}
          accessibilityHint={t('marketplace.campaign.announcements.dock.holdA11y')}
          sendingLabel={t('marketplace.campaign.announcements.dock.sending')}
          icon={Megaphone}
          onComplete={onSend}
        />
      )}
    </Box>
  );
};

export const AnnouncementDock = memo(AnnouncementDockComponent);
