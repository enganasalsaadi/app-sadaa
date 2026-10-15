import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, MapPin, Pencil, Phone } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Pressable, Text } from '@/shared/ui';
import { isolateLtr, isolateText } from '@/shared/utils';
import type { DealShippingAddress } from '../types';
import { addressPlace } from '../utils/dealShipping';

const PIN = moderateScale(40);

export interface DealShippingAddressCardProps {
  address: DealShippingAddress | null;
  /** Brand: copy the whole address for the courier. */
  onCopy?: () => void;
  /** Creator, while it can still change (or is still missing). */
  onEdit?: () => void;
  /** Whose address it is, for the waiting line («Sara hasn't added…»). */
  partyName: string;
}

/**
 * The delivery address as the courier needs it (B5.1): who, phone, place, the street line, the
 * landmark and notes. The brand copies it in one tap; the creator edits it until it ships. With
 * none yet: the creator gets the way to add it, the brand a calm waiting line.
 */
const DealShippingAddressCardComponent: React.FC<DealShippingAddressCardProps> = ({
  address,
  onCopy,
  onEdit,
  partyName,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'pin' | 'phone', ViewStyle> => ({
      pin: {
        width: PIN,
        height: PIN,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      // A phone number reads left to right in either language.
      phone: { direction: 'ltr' },
    }),
    [colors.interactive.soft],
  );

  const action = address && onCopy ? (
    <Pressable
      row
      align="center"
      gap="xs"
      px="md"
      height={sizes.button.md}
      borderRadius="sm"
      bg={colors.interactive.soft}
      scaleOnPress
      onPress={onCopy}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.shipping.address.copy')}
    >
      <Copy size={sizes.icon.xs} color={colors.interactive.main} />
      <Text variant="buttonSmall" color={colors.interactive.text}>
        {t('marketplace.deals.shipping.address.copy')}
      </Text>
    </Pressable>
  ) : address && onEdit ? (
    <Pressable
      row
      align="center"
      gap="xs"
      px="md"
      height={sizes.button.md}
      borderRadius="sm"
      bg={colors.surface.elevated}
      scaleOnPress
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.shipping.address.edit')}
    >
      <Pencil size={sizes.icon.xs} color={colors.text.primary} />
      <Text variant="buttonSmall" color={colors.text.primary}>
        {t('marketplace.deals.shipping.address.edit')}
      </Text>
    </Pressable>
  ) : null;

  return (
    <Card p="lg">
      <Box gap="md">
      <Box row align="center" gap="md">
        <Box style={styles.pin}>
          <MapPin size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} accessibilityRole="header">
            {t('marketplace.deals.shipping.address.title')}
          </Text>
        </Box>
        {action}
      </Box>

      {address ? (
        <Box gap="xs" accessible>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {isolateText(address.recipientName)}
          </Text>
          <Box row align="center" gap="xs">
            <Phone size={sizes.icon.xs} color={colors.text.tertiary} />
            <Text variant="bodySmall" color={colors.text.secondary} style={styles.phone} selectable>
              {isolateLtr(address.phone)}
            </Text>
          </Box>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {addressPlace(address)}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {address.addressLine}
          </Text>
          {address.landmark ? (
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.deals.shipping.address.near', { landmark: address.landmark })}
            </Text>
          ) : null}
          {address.notes ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {address.notes}
            </Text>
          ) : null}
        </Box>
      ) : onEdit ? (
        <Box gap="md">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.shipping.address.missingCreator')}
          </Text>
          <CustomButton
            title={t('marketplace.deals.shipping.address.add')}
            size="md"
            fullWidth
            leftIcon={<MapPin />}
            onPress={onEdit}
          />
        </Box>
      ) : (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.deals.shipping.address.missingBrand', { name: isolateText(partyName) })}
        </Text>
      )}
      </Box>
    </Card>
  );
};

export const DealShippingAddressCard = memo(DealShippingAddressCardComponent);
