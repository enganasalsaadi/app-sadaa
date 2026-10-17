import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Lock } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { RestrictionNotice, RestrictionScope } from '../utils/restrictions';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export interface RestrictionDockTopProps {
  notice: RestrictionNotice;
  /** What the dock would have done: apply to a campaign, or accept a direct offer. */
  scope: RestrictionScope;
  /** «Why?»: the strikes (a ban) or the deal that owes the waybill. */
  onWhy: () => void;
}

/**
 * Over a dock that can't act (PC9.0 frame 4): the lock bar says what stopped it and until when, in
 * place of the silent disabled button. An owed waybill has its key action in the dock's own button;
 * a ban or an unknown block gets «Why?», which opens the strikes.
 */
const RestrictionDockTopComponent: React.FC<RestrictionDockTopProps> = ({ notice, scope, onWhy }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const owed = notice.kind === 'return_pending';
  const hue = resolveHue(colors, owed ? 'warning' : 'danger');
  const Icon = owed ? Lock : Ban;
  const endsAt = notice.kind === 'return_pending' ? null : notice.endsAt;
  const title = owed
    ? t(scope === 'public' ? 'marketplace.restrictions.dock.owed.public' : 'marketplace.restrictions.dock.owed.direct')
    : endsAt === null
      ? notice.label || t('marketplace.restrictions.dock.stopped')
      : t('marketplace.restrictions.dock.until', { date: formatDate(endsAt, DATE_FORMAT, i18n.language) });

  return (
    <Box row align="center" gap="md" p="md" borderRadius="lg" bg={hue.soft} accessible accessibilityRole="alert">
      <Icon size={sizes.icon.md} color={hue.main} strokeWidth={iconStroke.bold} />
      <Box flex={1}>
        <Text variant="bodySmall" color={hue.text}>
          {title}
        </Text>
      </Box>
      {owed ? null : (
        <Pressable
          onPress={onWhy}
          px="md"
          py="sm"
          borderRadius="full"
          bg={colors.surface.main}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.restrictions.dock.why')}
        >
          <Text variant="buttonSmall" color={hue.text}>
            {t('marketplace.restrictions.dock.why')}
          </Text>
        </Pressable>
      )}
    </Box>
  );
};

export const RestrictionDockTop = memo(RestrictionDockTopComponent);
