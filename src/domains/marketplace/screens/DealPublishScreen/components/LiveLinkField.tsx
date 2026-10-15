import React, { memo, useEffect, useMemo } from 'react';
import { TextInput, Vibration, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useController, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Link2 } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import {
  DEAL_LIVE_PLATFORM_LABEL,
  DEAL_LIVE_URL_REASON_COPY,
  DEAL_PUBLISH_LIMITS,
} from '../../../constants/dealPublish';
import type { DealPublishFormValues } from '../../../schemas/dealPublishSchema';
import { isLivePlatform, isLiveUrlReason, parseLiveUrl } from '../../../utils/dealPublish';

const TILE = moderateScale(42);
const BAR = moderateScale(62);
const SHAKE = moderateScale(6);
const SHAKE_MS = 60;
/** Warning buzz: two short pulses. */
const WARN_PATTERN = [0, 30, 60, 30];

export interface LiveLinkFieldProps {
  control: Control<DealPublishFormValues>;
  /** The item's platform (`null` = no platform: the link is optional). */
  platform: string | null;
  onPaste: () => void;
}

/**
 * The live link as a browser address bar (approved «على الهواء»): the platform the host belongs to
 * lights up in the tile, «Paste» fills it from the clipboard, and a refused link shakes the bar
 * with a warning buzz and says why underneath (the server's reason or the app's own check, same
 * words), with what to do about it.
 */
const LiveLinkFieldComponent: React.FC<LiveLinkFieldProps> = ({ control, platform, onPaste }) => {
  const { t } = useTranslation();
  const { colors, sizes, typography } = useTheme();
  const reduceMotion = useReducedMotion();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name: 'url' });

  const parsed = useMemo(() => parseLiveUrl(value), [value]);
  const expected = isLivePlatform(platform) ? platform : null;
  const detected = parsed?.platform ?? null;
  const platformLabel = expected ? t(DEAL_LIVE_PLATFORM_LABEL[expected]) : '';
  const state = error ? 'bad' : parsed && (!expected || detected === expected) ? 'ok' : 'idle';

  const offset = useSharedValue(0);
  const errorKey = error ? `${error.type}:${error.message ?? ''}` : null;
  useEffect(() => {
    if (!errorKey) return;
    Vibration.vibrate(WARN_PATTERN);
    if (reduceMotion) return;
    const step = (to: number) => withTiming(to, { duration: SHAKE_MS });
    offset.value = withSequence(step(-SHAKE), step(SHAKE), step(-SHAKE), step(SHAKE), step(0));
  }, [errorKey, offset, reduceMotion]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const styles = useStyles(
    ({ radii, spacing, borderWidths, shadows }): Record<'bar' | 'tile' | 'paste' | 'diag' | 'dot', ViewStyle> & {
      input: TextStyle;
    } => ({
      bar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: BAR,
        paddingStart: spacing.sm,
        paddingEnd: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.md,
        borderColor:
          state === 'bad' ? colors.status.warning.main : state === 'ok' ? colors.interactive.main : colors.border.card,
        ...shadows.card,
      },
      tile: {
        width: TILE,
        height: TILE,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: detected ? colors.brand.main : colors.surface.elevated,
      },
      input: {
        flex: 1,
        minHeight: BAR,
        fontSize: typography.body.fontSize,
        fontFamily: typography.body.fontFamily,
        fontWeight: typography.body.fontWeight,
        color: colors.text.primary,
        // A link reads left to right in both languages.
        writingDirection: 'ltr',
        textAlign: 'auto',
      },
      paste: {
        minHeight: sizes.button.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.sm,
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      diag: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.status.warning.soft,
      },
      dot: {
        width: sizes.control.dot,
        height: sizes.control.dot,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.main,
      },
    }),
    [colors, detected, sizes, state, typography.body],
  );

  const reason = error && isLiveUrlReason(error.type) ? DEAL_LIVE_URL_REASON_COPY[error.type] : null;
  const hint = detected
    ? t('marketplace.deals.publish.link.detected', { platform: t(DEAL_LIVE_PLATFORM_LABEL[detected]) })
    : expected
      ? t('marketplace.deals.publish.link.waiting')
      : t('marketplace.deals.publish.link.noPlatform');

  return (
    <Box gap="sm">
      <Text variant="overline" color={colors.text.tertiary}>
        {expected ? t('marketplace.deals.publish.link.label') : t('marketplace.deals.publish.link.optional')}
      </Text>
      <Animated.View style={[styles.bar, shakeStyle]}>
        <Box style={styles.tile}>
          {detected ? (
            <SocialPlatformIcon platform={detected} size={sizes.icon.md} color={colors.text.onBrand} />
          ) : (
            <Link2 size={sizes.icon.md} color={colors.icon.secondary} />
          )}
        </Box>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          style={styles.input}
          placeholder={t('marketplace.deals.publish.link.placeholder')}
          placeholderTextColor={colors.form.input.placeholder}
          selectionColor={colors.interactive.main}
          keyboardType="url"
          textContentType="URL"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="done"
          maxLength={DEAL_PUBLISH_LIMITS.url}
          numberOfLines={1}
          accessibilityLabel={t('marketplace.deals.publish.link.label')}
        />
        <Pressable
          style={styles.paste}
          onPress={onPaste}
          scaleOnPress
          hitSlop={sizes.hitSlop.sm}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.publish.link.pasteA11y')}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.deals.publish.link.paste')}
          </Text>
        </Pressable>
      </Animated.View>
      {error ? (
        <Box style={styles.diag} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <AlertTriangle size={sizes.icon.sm} color={colors.status.warning.main} />
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" color={colors.status.warning.text}>
              {error.message}
            </Text>
            {reason ? (
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t(reason.body, { platform: platformLabel })}
              </Text>
            ) : null}
          </Box>
        </Box>
      ) : (
        <Box row align="center" gap="sm" px="xs">
          {detected ? <Box style={styles.dot} /> : null}
          <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
            {hint}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export const LiveLinkField = memo(LiveLinkFieldComponent);
