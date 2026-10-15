import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomInput, Image, Pressable, Text } from '@/shared/ui';
import { DEAL_DRAFT_LIMITS } from '../../../constants/dealDrafts';
import type { DealDraftFormValues } from '../../../schemas/dealDraftSchema';
import type { DealCreatorParty } from '../../../types';
import { monogramOf } from '../../../utils/creatorText';
import { isTokenInCaption, type CaptionToken } from '../../../utils/dealDrafts';

const AVATAR = moderateScale(30);
const RING = moderateScale(2);

export interface DraftCaptionCardProps {
  creator: DealCreatorParty;
  /** Composing: the caption field; else the handed-in caption, read only. */
  control?: Control<DealDraftFormValues>;
  caption?: string | null;
  tokens: CaptionToken[];
  onInsert?: (token: string) => void;
}

const TokenChip = memo<{ token: CaptionToken; used: boolean; onInsert?: (token: string) => void }>(
  ({ token, used, onInsert }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const insert = useCallback(() => onInsert?.(token.text), [onInsert, token.text]);
    const styles = useStyles(
      ({ radii, spacing, sizes: size }): Record<'chip', ViewStyle> => ({
        chip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          minHeight: size.button.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radii.sm,
          backgroundColor: used ? colors.interactive.soft : colors.surface.elevated,
        },
      }),
      [colors.interactive.soft, colors.surface.elevated, used],
    );
    return (
      <Pressable
        style={styles.chip}
        onPress={used ? undefined : insert}
        scaleOnPress={!used}
        hitSlop={sizes.hitSlop.sm}
        accessibilityRole="button"
        accessibilityState={{ disabled: used }}
        accessibilityLabel={
          used
            ? t('marketplace.deals.drafts.upload.caption.included', { token: token.text })
            : t('marketplace.deals.drafts.upload.caption.insert', { token: token.text })
        }
      >
        <Text variant="buttonSmall" color={used ? colors.interactive.text : colors.text.primary}>
          {token.text}
        </Text>
        {used ? <Check size={sizes.icon.xs} color={colors.interactive.main} /> : null}
      </Pressable>
    );
  },
);

/** Brief words the caption should carry; each turns teal ✓ once it's in. */
const BriefTokens = memo<{
  text: string;
  tokens: CaptionToken[];
  onInsert?: (token: string) => void;
}>(({ text, tokens, onInsert }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (tokens.length === 0) return null;
  return (
    <Box row gap="xs" align="center" wrap>
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.deals.drafts.upload.caption.fromBrief')}
      </Text>
      {tokens.map(token => (
        <TokenChip
          key={token.text}
          token={token}
          used={isTokenInCaption(text, token.text)}
          onInsert={onInsert}
        />
      ))}
    </Box>
  );
});

/** The chips while typing: watches only the caption field. */
const WatchedTokens = memo<{
  control: Control<DealDraftFormValues>;
  tokens: CaptionToken[];
  onInsert?: (token: string) => void;
}>(({ control, tokens, onInsert }) => {
  const text = useWatch({ control, name: 'caption' });
  return <BriefTokens text={text} tokens={tokens} onInsert={onInsert} />;
});

/**
 * The caption as it will sit under the post: the creator's ring and name over the text, then the
 * brief's mentions, hashtags and code to drop in with a tap.
 */
const DraftCaptionCardComponent: React.FC<DraftCaptionCardProps> = ({
  creator,
  control,
  caption,
  tokens,
  onInsert,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card' | 'ring' | 'monogram', ViewStyle> => ({
      card: {
        borderRadius: radii.lg,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      ring: {
        width: AVATAR + RING * 2,
        height: AVATAR + RING * 2,
        borderRadius: radii.full,
        padding: RING,
        backgroundColor: colors.interactive.main,
      },
      monogram: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.soft,
      },
    }),
    [colors],
  );
  const name = creator.name ?? '';
  return (
    <Box style={styles.card}>
      <Box row align="center" gap="sm">
        <Box style={styles.ring}>
          {creator.avatarUrl ? (
            <Image uri={creator.avatarUrl} size={AVATAR} circle />
          ) : (
            <Box style={styles.monogram}>
              <Text variant="label" color={colors.brand.text}>
                {monogramOf(name)}
              </Text>
            </Box>
          )}
        </Box>
        <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
          {t('marketplace.deals.drafts.upload.caption.label')}
        </Text>
      </Box>
      {control ? (
        <Controller
          control={control}
          name="caption"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              accessibilityLabel={t('marketplace.deals.drafts.upload.caption.label')}
              placeholder={t('marketplace.deals.drafts.upload.caption.placeholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={5}
              showCount
              maxLength={DEAL_DRAFT_LIMITS.caption}
              error={fieldState.error?.message}
            />
          )}
        />
      ) : (
        <Text variant="body" color={colors.text.primary}>
          {caption ?? ''}
        </Text>
      )}
      {control ? (
        <WatchedTokens control={control} tokens={tokens} onInsert={onInsert} />
      ) : (
        <BriefTokens text={caption ?? ''} tokens={tokens} />
      )}
    </Box>
  );
};

export const DraftCaptionCard = memo(DraftCaptionCardComponent);
