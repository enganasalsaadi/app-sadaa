import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, TriangleAlert } from 'lucide-react-native';
import { ListGroup, ListRow, Notice, Switch } from '@/shared/ui';
import type { BrandVisibilityModel } from '../../../hooks/useBrandVisibility';

interface BrandVisibilityCardProps {
  model: BrandVisibilityModel;
}

/** Brand privacy switch; a failed load offers a retry instead of a switch with a guessed value. */
const BrandVisibilityCardComponent: React.FC<BrandVisibilityCardProps> = ({ model }) => {
  const { t } = useTranslation();
  const title = t('account.profile.brandVisibility.title');

  if (model.isError) {
    return (
      <Notice
        tone="warning"
        icon={TriangleAlert}
        title={title}
        message={t('account.profile.brandVisibility.loadFailed')}
        action={{ label: t('account.profile.brandVisibility.retry'), onPress: model.retry }}
      />
    );
  }

  return (
    <ListGroup>
      <ListRow
        icon={Eye}
        title={title}
        subtitle={t('account.profile.brandVisibility.subtitle')}
        loading={model.isLoading}
        trailing={
          model.visible === null ? null : (
            <Switch
              value={model.visible}
              onValueChange={model.onToggle}
              accessibilityLabel={title}
              disabled={model.isSaving}
            />
          )
        }
      />
    </ListGroup>
  );
};

export const BrandVisibilityCard = memo(BrandVisibilityCardComponent);
