import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Tags } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Notice, Rail, SectionHeader, Skeleton, Text } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { PRICE_TAG_HEIGHT, PRICE_TAG_WIDTH, PriceTag } from './PriceTag';

const SKELETON_TAGS = ['a', 'b'] as const;

interface PriceTagsSectionProps {
  rates: CreatorHomeScreenModel['rates'];
  onEdit: () => void;
}

/** No prices yet: say what an empty list costs, and the one way out. */
const NoRates = memo<{ onAdd: () => void }>(({ onAdd }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <Tags size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title">{t('marketplace.creatorHome.rates.emptyTitle')}</Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.creatorHome.rates.empty')}
            </Text>
          </Box>
        </Box>
        <CustomButton
          title={t('marketplace.creatorHome.rates.add')}
          variant="secondary"
          size="md"
          leftIcon={<Plus />}
          onPress={onAdd}
          fullWidth
        />
      </Box>
    </Card>
  );
});

/**
 * «أسعارك»: every saved price as a tag hanging from one sideways rail, closed by a dashed
 * "new rate" tag. A creator's own list is bounded (one slot per service), so the rail
 * renders it whole. Tapping any tag opens the rates screen.
 */
const PriceTagsSectionComponent: React.FC<PriceTagsSectionProps> = ({ rates, onEdit }) => {
  const { t } = useTranslation();
  const hasRows = rates.rows.length > 0;

  const renderBody = () => {
    if (rates.isLoading) {
      return (
        <Box row gap="md" px="xl">
          {SKELETON_TAGS.map(key => (
            <Skeleton key={key} width={PRICE_TAG_WIDTH} height={PRICE_TAG_HEIGHT} borderRadius="lg" />
          ))}
        </Box>
      );
    }
    if (rates.isError) {
      return (
        <Box px="xl">
          <Notice
            tone="danger"
            message={t('marketplace.creatorHome.rates.loadFailed')}
            action={{ label: t('common.retry'), onPress: rates.retry }}
          />
        </Box>
      );
    }
    if (!hasRows) {
      return (
        <Box px="xl">
          <NoRates onAdd={onEdit} />
        </Box>
      );
    }
    // Room for the tags' lean and swing; their drop is drawn inside each tag. The `md` gap is the
    // one each tag's rail segment bridges.
    return (
      <Rail gap="md" py="md">
        {rates.rows.map((row, index) => (
          <PriceTag key={row.key} row={row} index={index} onPress={onEdit} />
        ))}
        <PriceTag row={null} index={rates.rows.length} onPress={onEdit} />
      </Rail>
    );
  };

  return (
    <Box gap="sm">
      <Box px="xl">
        <SectionHeader
          title={t('marketplace.creatorHome.rates.title')}
          emphasis="strong"
          action={hasRows ? { label: t('marketplace.creatorHome.rates.edit'), onPress: onEdit } : undefined}
        />
      </Box>
      {renderBody()}
    </Box>
  );
};

export const PriceTagsSection = memo(PriceTagsSectionComponent);
