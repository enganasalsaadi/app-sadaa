import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarGroup, Box } from '@/shared/ui';
import type { AvatarGroupSize } from '@/shared/ui';
import { MOCK_AVATAR_GROUP } from './mockData';

const SIZES: AvatarGroupSize[] = ['xs', 'sm', 'md'];
const FEW = 3;

const AvatarGroupDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const label = t('devShowcase.avatarGroup.applicants', { count: MOCK_AVATAR_GROUP.length });

  return (
    <Box gap="lg">
      {SIZES.map(size => (
        <AvatarGroup key={size} items={MOCK_AVATAR_GROUP} size={size} accessibilityLabel={label} />
      ))}
      <AvatarGroup
        items={MOCK_AVATAR_GROUP.slice(0, FEW)}
        accessibilityLabel={t('devShowcase.avatarGroup.applicants', { count: FEW })}
      />
    </Box>
  );
};

export const AvatarGroupDemo = memo(AvatarGroupDemoComponent);
