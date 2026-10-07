import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Divider, KeyValueRow, SectionHeader, StatusPill, Text } from '@/shared/ui';
import { formatMoney } from '@/core/i18n';
import { MOCK_DEAL_SUMMARY } from './mockData';

const noop = () => {};

const StructureDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.structure.sectionTitle')} />
        <SectionHeader
          title={t('devShowcase.structure.sectionTitle')}
          subtitle={t('devShowcase.structure.sectionSubtitle')}
          action={{ label: t('common.seeAll'), onPress: noop }}
        />
        <SectionHeader
          title={t('devShowcase.structure.sectionTitle')}
          emphasis="strong"
          action={{ label: t('common.seeAll'), onPress: noop }}
        />
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.structure.dividerTitle')} />
        <Divider />
        <Divider variant="strong" spacing="sm" />
        <Divider inset="3xl" />
        <Box row align="center">
          <Text variant="bodySmall">{t('devShowcase.structure.left')}</Text>
          <Divider vertical spacing="md" />
          <Text variant="bodySmall">{t('devShowcase.structure.right')}</Text>
        </Box>
      </Box>

      <Box gap="xs">
        <SectionHeader title={t('devShowcase.structure.summaryTitle')} />
        <KeyValueRow label={t('devShowcase.structure.budget')} value={formatMoney(MOCK_DEAL_SUMMARY.budget)} />
        <KeyValueRow
          label={t('devShowcase.structure.commission')}
          hint={t('devShowcase.structure.commissionHint')}
          value={formatMoney(MOCK_DEAL_SUMMARY.commission)}
        />
        <KeyValueRow label={t('devShowcase.structure.upfront')} value={formatMoney(MOCK_DEAL_SUMMARY.upfront)} />
        <KeyValueRow
          label={t('devShowcase.structure.status')}
          value={<StatusPill tone="info" label={t('devShowcase.badges.underReview')} />}
        />
        <Divider spacing="xs" />
        <KeyValueRow
          label={t('devShowcase.structure.payout')}
          value={formatMoney(MOCK_DEAL_SUMMARY.payout)}
          emphasis="money"
        />
        <KeyValueRow
          label={t('devShowcase.structure.total')}
          value={formatMoney(MOCK_DEAL_SUMMARY.budget)}
          emphasis="strong"
        />
      </Box>
    </Box>
  );
};

export const StructureDemo = memo(StructureDemoComponent);
