import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ListGroup, ListRow } from '@/shared/ui';
import { MOCK_SCROLL_ROWS } from '../demos/mockData';

/** Static filler for the layout screens; not a pattern for real (dynamic) lists, which use SuperList. */
const DemoScrollRowsComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ListGroup>
      {MOCK_SCROLL_ROWS.map(index => (
        <ListRow key={index} title={t('devShowcase.layoutGallery.noScrollWithHandlerRow', { index })} />
      ))}
    </ListGroup>
  );
};

export const DemoScrollRows = memo(DemoScrollRowsComponent);
