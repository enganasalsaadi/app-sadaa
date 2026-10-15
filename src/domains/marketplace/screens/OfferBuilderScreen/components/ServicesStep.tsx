import React, { memo } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PackageSearch } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, StaggerIn, Text } from '@/shared/ui';
import { quoteLineTotal } from '../../../utils/dealOfferMappers';
import { useOfferBuilder } from '../OfferBuilderContext';
import { DeliverySection } from './DeliverySection';
import { ServiceCard } from '../../../components/ServiceCard';
import { ShippingSection } from './ShippingSection';

/** Step 1: what the brand buys (rate cards, quantity, add-ons), whether a product ships, and when. */
const ServicesStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { creatorName, services, offer, quote, lines, form } = useOfferBuilder();
  const { errors } = useFormState({ control: form.control, name: 'lines' });
  const pickError = errors.lines?.message ?? errors.lines?.root?.message;

  return (
    <Box gap="3xl">
      <Box gap="lg">
        <Box gap="xs">
          <Text variant="h3" color={colors.text.primary}>
            {t('marketplace.offer.services.title', { name: creatorName })}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.offer.services.body')}
          </Text>
        </Box>
        {services.length === 0 ? (
          <Box align="center" gap="sm" p="2xl" borderRadius="xl" bg={colors.surface.main} shadow="card">
            <PackageSearch size={sizes.icon.xl} color={colors.text.tertiary} />
            <Text variant="title" color={colors.text.primary} align="center">
              {t('marketplace.offer.services.emptyTitle')}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary} align="center">
              {t('marketplace.offer.services.emptyBody', { name: creatorName })}
            </Text>
          </Box>
        ) : (
          <StaggerIn gap="md">
            {services.map(service => {
              const line = offer.lines.find(entry => entry.rateCardId === service.rateCardId);
              return (
                <ServiceCard
                  key={service.rateCardId}
                  service={service}
                  line={line}
                  lineTotal={quoteLineTotal(quote, service.rateCardId)}
                  maxQuantity={line ? lines.maxQuantity(line) : 1}
                  onToggle={lines.toggleService}
                  onQuantity={lines.setQuantity}
                  onToggleAddon={lines.toggleAddon}
                />
              );
            })}
          </StaggerIn>
        )}
        {pickError ? (
          <Text variant="bodySmall" color={colors.status.danger.text} accessibilityRole="alert">
            {pickError}
          </Text>
        ) : null}
      </Box>
      <ShippingSection />
      <DeliverySection />
    </Box>
  );
};

export const ServicesStep = memo(ServicesStepComponent);
