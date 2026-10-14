import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CalendarHeart, Megaphone, MessageSquareQuote, Rocket, TicketPercent, Wand2, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Rail, Text } from '@/shared/ui';
import { BRIEF_TEMPLATES, type BriefTemplateKey } from '../hooks/useOfferBrief';

const TEMPLATE = {
  launch: { icon: Rocket, title: 'marketplace.offer.brief.template.launch.title', body: 'marketplace.offer.brief.template.launch.body' },
  offer: { icon: TicketPercent, title: 'marketplace.offer.brief.template.offer.title', body: 'marketplace.offer.brief.template.offer.body' },
  event: { icon: CalendarHeart, title: 'marketplace.offer.brief.template.event.title', body: 'marketplace.offer.brief.template.event.body' },
  review: {
    icon: MessageSquareQuote,
    title: 'marketplace.offer.brief.template.review.title',
    body: 'marketplace.offer.brief.template.review.body',
  },
  awareness: {
    icon: Megaphone,
    title: 'marketplace.offer.brief.template.awareness.title',
    body: 'marketplace.offer.brief.template.awareness.body',
  },
} as const satisfies Record<BriefTemplateKey, { icon: LucideIcon; title: string; body: string }>;

interface BriefTemplatesProps {
  onApply: (key: BriefTemplateKey) => void;
}

/** A shelf of one-tap starting points: each fills talking points and don'ts the brand can edit. */
const BriefTemplatesComponent: React.FC<BriefTemplatesProps> = ({ onApply }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'mark', ViewStyle> => ({
      card: {
        width: sizes.thumbnail.lg + spacing['2xl'],
        padding: spacing.md,
        gap: spacing.xs,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        ...shadows.card,
      },
      mark: {
        width: sizes.icon.lg,
        height: sizes.icon.lg,
        borderRadius: radii.sm,
        backgroundColor: colors.brand.soft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
      },
    }),
    [colors.brand.soft, colors.surface.main, sizes.icon.lg, sizes.thumbnail.lg],
  );
  return (
    <Box gap="sm">
      <Box row align="center" gap="xs">
        <Wand2 size={sizes.icon.xs} color={colors.text.secondary} />
        <Text variant="bodyMedium" color={colors.text.secondary}>
          {t('marketplace.offer.brief.templates')}
        </Text>
      </Box>
      {/* Bleeds to the screen edges like a shelf; the body's gutter is undone here. */}
      <Rail shadow="card" gap="sm" bleed>
          {BRIEF_TEMPLATES.map(key => {
            const { icon: Icon, title, body } = TEMPLATE[key];
            return (
              <Pressable
                key={key}
                style={styles.card}
                scaleOnPress
                onPress={() => onApply(key)}
                accessibilityRole="button"
                accessibilityLabel={t(title)}
              >
                <Box style={styles.mark}>
                  <Icon size={sizes.icon.sm} color={colors.brand.text} />
                </Box>
                <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
                  {t(title)}
                </Text>
                <Text variant="caption" color={colors.text.tertiary} numberOfLines={2}>
                  {t(body)}
                </Text>
              </Pressable>
            );
          })}
      </Rail>
    </Box>
  );
};

export const BriefTemplates = memo(BriefTemplatesComponent);
