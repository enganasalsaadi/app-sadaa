import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, InlineError } from '@/shared/ui';

const InlineErrorDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <InlineError error={t('devShowcase.inlineError.message')} />
    </Box>
  );
};

export const InlineErrorDemo = memo(InlineErrorDemoComponent);
