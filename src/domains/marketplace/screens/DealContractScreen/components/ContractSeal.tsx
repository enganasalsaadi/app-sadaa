import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, Fingerprint, PenLine } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Text } from '@/shared/ui';
import type { DealRole, DealSignature } from '../../../types';

const SIGNED_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};
const PARTIES: readonly DealRole[] = ['brand', 'creator'];

export interface ContractSealProps {
  hash: string;
  signatures: DealSignature[];
  /** Party names as the contract states them. */
  names: Record<DealRole, string>;
  onCopy: (hash: string) => void;
}

/**
 * The seal under a document: who signed and when (both parties, a missing one says so), and the
 * fingerprint any change to the text would break, ready to copy.
 */
const ContractSealComponent: React.FC<ContractSealProps> = ({
  hash,
  signatures,
  names,
  onCopy,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const copy = useCallback(() => onCopy(hash), [hash, onCopy]);
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'seal', ViewStyle> => ({
      seal: {
        borderRadius: radii.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: borderWidths.sm,
        borderStyle: 'dashed',
        borderColor: colors.interactive.main,
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors.interactive.main, colors.interactive.soft],
  );

  return (
    <Box style={styles.seal}>
      <Text variant="overline" color={colors.interactive.text}>
        {t('marketplace.deals.contract.signatures')}
      </Text>
      {PARTIES.map(party => {
        const signed = signatures.find(signature => signature.party === party);
        return (
          <Box key={party} row align="center" gap="sm">
            <PenLine
              size={sizes.icon.sm}
              color={signed ? colors.interactive.main : colors.icon.secondary}
            />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.primary}>
                {signed
                  ? t('marketplace.deals.contract.signedBy', {
                      party: names[party],
                    })
                  : t('marketplace.deals.contract.notSigned', {
                      party: names[party],
                    })}
              </Text>
              {signed ? (
                <Text variant="caption" color={colors.text.tertiary}>
                  {formatDate(signed.signedAt, SIGNED_FORMAT, i18n.language)}
                </Text>
              ) : null}
            </Box>
          </Box>
        );
      })}
      <Box
        row
        align="center"
        gap="sm"
        pt="sm"
        borderTopWidth="hairline"
        borderColor={colors.interactive.main}
      >
        <Fingerprint size={sizes.icon.sm} color={colors.interactive.main} />
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.contract.fingerprint')}
          </Text>
          <Text
            variant="caption"
            color={colors.text.primary}
            writingDirection="ltr"
            numberOfLines={2}
            selectable
          >
            {hash}
          </Text>
        </Box>
        <IconButton
          icon={Copy}
          variant="ghost"
          onPress={copy}
          accessibilityLabel={t('marketplace.deals.contract.copyFingerprint')}
        />
      </Box>
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.deals.contract.fingerprintHint')}
      </Text>
    </Box>
  );
};

export const ContractSeal = memo(ContractSealComponent);
