import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Target, TicketPercent } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomInput } from '@/shared/ui';
import { BriefBlock } from '../../../components/brief/BriefBlock';
import { useCampaignWizard } from '../CampaignWizardContext';

/** How the brand measures the posts: a discount code and a tracking link said in the content. */
const CampaignBriefMeasureComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { brief } = useCampaignWizard();
  const { setPromoCode, setTrackingLink, promoMax, trackingMax, promoError, trackingError } = brief;

  return (
    <BriefBlock icon={Target} title={t('marketplace.offer.brief.measure.title')} body={t('marketplace.offer.brief.measure.body')}>
      <Box>
        <CustomInput
          label={t('marketplace.offer.brief.measure.promo')}
          placeholder={t('marketplace.offer.brief.measure.promoPlaceholder')}
          value={brief.brief.promoCode}
          onChangeText={setPromoCode}
          maxLength={promoMax}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="next"
          leftIcon={<TicketPercent size={sizes.icon.sm} color={colors.text.tertiary} />}
          mb="md"
          error={promoError}
        />
        <CustomInput
          label={t('marketplace.offer.brief.measure.link')}
          placeholder={t('marketplace.offer.brief.measure.linkPlaceholder')}
          value={brief.brief.trackingLink}
          onChangeText={setTrackingLink}
          maxLength={trackingMax}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="URL"
          returnKeyType="done"
          leftIcon={<Link2 size={sizes.icon.sm} color={colors.text.tertiary} />}
          error={trackingError}
        />
      </Box>
    </BriefBlock>
  );
};

export const CampaignBriefMeasure = memo(CampaignBriefMeasureComponent);
