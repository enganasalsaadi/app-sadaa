import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { formatDate, formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealAddendum, DealRole } from '../../../types';
import { addendumClause, type ContractLang } from '../../../utils/dealContract';
import { ContractSeal } from './ContractSeal';

const TYPE_LABEL: Record<string, ParseKeys> = {
  deadline_extension:
    'marketplace.deals.contract.addendumType.deadline_extension',
  upsell: 'marketplace.deals.contract.addendumType.upsell',
};
const ISSUED_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export interface ContractAddendumCardProps {
  addendum: DealAddendum;
  lang: ContractLang;
  names: Record<DealRole, string>;
  onCopy: (hash: string) => void;
}

/** One addendum: its number and kind, the clause it adds, and its own seal. */
const ContractAddendumCardComponent: React.FC<ContractAddendumCardProps> = ({
  addendum,
  lang,
  names,
  onCopy,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const clause = addendumClause(addendum.document, lang);
  const typeKey =
    (addendum.type && TYPE_LABEL[addendum.type]) ||
    'marketplace.deals.contract.addendumType.other';
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [colors.border.card, colors.surface.main],
  );

  return (
    <Box style={styles.card}>
      <Box row align="center" justify="space-between" gap="md">
        <Text variant="title" color={colors.text.primary}>
          {t('marketplace.deals.contract.addendum', {
            number: formatNumber(addendum.sequence),
          })}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.contract.issued', {
            date: formatDate(addendum.issuedAt, ISSUED_FORMAT, i18n.language),
          })}
        </Text>
      </Box>
      <Text variant="buttonSmall" color={colors.interactive.text}>
        {t(typeKey)}
      </Text>
      {clause ? (
        <Text
          variant="bodySmall"
          color={colors.text.primary}
          writingDirection={lang === 'en' ? 'ltr' : 'rtl'}
        >
          {clause}
        </Text>
      ) : null}
      <ContractSeal
        hash={addendum.hash}
        signatures={addendum.signatures}
        names={names}
        onCopy={onCopy}
      />
    </Box>
  );
};

export const ContractAddendumCard = memo(ContractAddendumCardComponent);
