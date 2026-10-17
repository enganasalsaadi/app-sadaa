import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, EyeOff, MapPin } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealShippingAddress } from '../../../types/deal';
import { addressPlace } from '../../../utils/dealShipping';

export interface ParcelAddressProps {
  dealId: string;
  name: string;
  address: DealShippingAddress;
  revealed: boolean;
  /** One stable handler for every row. */
  onToggle: (dealId: string) => void;
  onCopy: (dealId: string) => void;
}

/**
 * The creator's delivery address, hidden until tapped (the server logs that the manifest was read;
 * this only keeps it off a screen glanced over a shoulder). Revealed: who and where, with a copy for
 * the courier; it hides again when the app leaves the foreground.
 */
const ParcelAddressComponent: React.FC<ParcelAddressProps> = ({ dealId, name, address, revealed, onToggle, onCopy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const toggle = useCallback(() => onToggle(dealId), [dealId, onToggle]);
  const copy = useCallback(() => onCopy(dealId), [dealId, onCopy]);
  const Toggle = revealed ? EyeOff : Eye;

  return (
    <Box row align="center" gap="sm" mx="md" mb="sm" px="md" py="sm" borderRadius="md" bg={colors.surface.elevated}>
      <MapPin size={sizes.icon.xs} color={colors.text.tertiary} />
      <Box flex={1}>
        {revealed ? (
          <>
            <Text variant="bodySmall" color={colors.text.primary}>
              {[address.recipientName, isolateLtr(address.phone)].join(' · ')}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {[addressPlace(address), address.addressLine].filter(Boolean).join('، ')}
            </Text>
          </>
        ) : (
          <Text variant="bodySmall" color={colors.text.tertiary}>
            {t('marketplace.campaign.shipping.address.hidden')}
          </Text>
        )}
      </Box>
      {revealed ? (
        <Pressable
          onPress={copy}
          hitSlop={sizes.icon.xs}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.campaign.shipping.address.copy', { name })}
        >
          <Copy size={sizes.icon.sm} color={colors.text.link} />
        </Pressable>
      ) : null}
      <Pressable
        row
        align="center"
        gap="xs"
        onPress={toggle}
        hitSlop={sizes.icon.xs}
        accessibilityRole="button"
        accessibilityLabel={t(
          revealed ? 'marketplace.campaign.shipping.address.hideA11y' : 'marketplace.campaign.shipping.address.revealA11y',
          { name },
        )}
      >
        <Toggle size={sizes.icon.xs} color={colors.text.link} />
        <Text variant="buttonSmall" color={colors.text.link}>
          {t(revealed ? 'marketplace.campaign.shipping.address.hide' : 'marketplace.campaign.shipping.address.reveal')}
        </Text>
      </Pressable>
    </Box>
  );
};

export const ParcelAddress = memo(ParcelAddressComponent);
