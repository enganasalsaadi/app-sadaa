import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Gift, Info, Package, PackageOpen, Undo2, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealShippingMode } from '../../../types/deal';
import { useOfferBuilder } from '../OfferBuilderContext';

type ProductMode = Exclude<DealShippingMode, 'none'>;

const KIND = {
  gift: { icon: Gift, title: 'marketplace.offer.shipping.giftTitle', body: 'marketplace.offer.shipping.giftBody' },
  returnable: {
    icon: Undo2,
    title: 'marketplace.offer.shipping.returnableTitle',
    body: 'marketplace.offer.shipping.returnableBody',
  },
} as const satisfies Record<ProductMode, { icon: LucideIcon; title: string; body: string }>;

interface ChoiceProps {
  icon: LucideIcon;
  title: string;
  body: string;
  on: boolean;
  onPress: () => void;
}

/** Big two-way choice (content only / I'll send a product): the picked one turns solid navy. */
const Choice = memo<ChoiceProps>(({ icon: Icon, title, body, on, onPress }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card', ViewStyle> => ({
      card: {
        flex: 1,
        minHeight: sizes.thumbnail.md + spacing['2xl'],
        padding: spacing.lg,
        gap: spacing.xs,
        borderRadius: radii.lg,
        backgroundColor: on ? colors.button.primary.bg : colors.surface.main,
        ...shadows.card,
      },
    }),
    [colors, on, sizes.thumbnail.md],
  );
  const tint = on ? colors.button.primary.text : colors.text.secondary;
  return (
    <Pressable style={styles.card} scaleOnPress onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={title}>
      <Box mb="xs">
        <Icon size={sizes.icon.md} color={tint} />
      </Box>
      <Text variant="bodyMedium" color={on ? colors.button.primary.text : colors.text.primary}>
        {title}
      </Text>
      <Text variant="caption" color={tint}>
        {body}
      </Text>
    </Pressable>
  );
});

interface KindRowProps {
  mode: ProductMode;
  on: boolean;
  last: boolean;
  onPress: (mode: ProductMode) => void;
}

const KindRow = memo<KindRowProps>(({ mode, on, last, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { icon: Icon, title, body } = KIND[mode];
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'row' | 'mark' | 'radio' | 'dot', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        minHeight: sizes.button.xl,
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        borderColor: on ? colors.interactive.main : colors.border.default,
        backgroundColor: on ? colors.interactive.soft : colors.surface.main,
      },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.sm,
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      },
      radio: {
        width: sizes.icon.sm + spacing.xs,
        height: sizes.icon.sm + spacing.xs,
        borderRadius: radii.full,
        borderWidth: borderWidths.md,
        borderColor: on ? colors.interactive.main : colors.border.strong,
        alignItems: 'center',
        justifyContent: 'center',
      },
      dot: { width: sizes.icon.xs - spacing.xs, height: sizes.icon.xs - spacing.xs, borderRadius: radii.full, backgroundColor: colors.interactive.main },
    }),
    [colors, on, sizes],
  );
  return (
    <Pressable style={styles.row} onPress={() => onPress(mode)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={t(title)}>
      <Box style={styles.mark}>
        <Icon size={sizes.icon.sm} color={colors.text.primary} />
      </Box>
      <Box flex={1}>
        <Box row align="center" gap="sm">
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t(title)}
          </Text>
          {last ? (
            <Box px="sm" borderRadius="full" bg={colors.premium.soft}>
              <Text variant="caption" color={colors.premium.text}>
                {t('marketplace.offer.shipping.lastPick')}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text variant="caption" color={colors.text.tertiary}>
          {t(body)}
        </Text>
      </Box>
      <Box style={styles.radio}>{on ? <Box style={styles.dot} /> : null}</Box>
    </Pressable>
  );
});

/**
 * «Does it include a product?»: content only (default) or a product, which opens the two
 * shipment kinds (the last one used is marked) and the note that the clock waits for receipt.
 */
const ShippingSectionComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { form, setHasProduct, lastShippingMode } = useOfferBuilder();
  const [hasProduct, shippingMode] = useWatch({ control: form.control, name: ['hasProduct', 'shippingMode'] });
  const { errors } = useFormState({ control: form.control, name: 'shippingMode' });
  const pickMode = (mode: ProductMode) => form.setValue('shippingMode', mode, { shouldValidate: true });

  return (
    <Box gap="md">
      <Box>
        <Text variant="h4" color={colors.text.primary}>
          {t('marketplace.offer.shipping.title')}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.shipping.body')}
        </Text>
      </Box>
      <Box row gap="md" accessibilityRole="radiogroup">
        <Choice
          icon={PackageOpen}
          title={t('marketplace.offer.shipping.digitalTitle')}
          body={t('marketplace.offer.shipping.digitalBody')}
          on={!hasProduct}
          onPress={() => setHasProduct(false)}
        />
        <Choice
          icon={Package}
          title={t('marketplace.offer.shipping.productTitle')}
          body={t('marketplace.offer.shipping.productBody')}
          on={hasProduct}
          onPress={() => setHasProduct(true)}
        />
      </Box>
      {hasProduct ? (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.springify()}>
          <Box gap="sm" accessibilityRole="radiogroup">
            {(['gift', 'returnable'] as const).map(mode => (
              <KindRow key={mode} mode={mode} on={shippingMode === mode} last={lastShippingMode === mode} onPress={pickMode} />
            ))}
            {errors.shippingMode?.message ? (
              <Text variant="caption" color={colors.status.danger.text} accessibilityRole="alert">
                {errors.shippingMode.message}
              </Text>
            ) : null}
            <Box row gap="sm" align="flex-start" p="md" borderRadius="md" bg={colors.status.info.soft}>
              <Info size={sizes.icon.sm} color={colors.status.info.main} />
              <Box flex={1}>
                <Text variant="caption" color={colors.status.info.text}>
                  {t('marketplace.offer.shipping.note')}
                </Text>
              </Box>
            </Box>
          </Box>
        </Animated.View>
      ) : null}
    </Box>
  );
};

export const ShippingSection = memo(ShippingSectionComponent);
