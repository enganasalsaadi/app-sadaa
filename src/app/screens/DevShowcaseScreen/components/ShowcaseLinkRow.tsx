import React, { memo, useCallback } from 'react';
import { ListRow } from '@/shared/ui';

interface ShowcaseLinkRowProps<T extends string> {
  id: T;
  title: string;
  description: string;
  onPress: (id: T) => void;
}

/** Binds a route/category id to a `ListRow` so the parent passes one stable handler. */
const ShowcaseLinkRowComponent = <T extends string>({
  id,
  title,
  description,
  onPress,
}: ShowcaseLinkRowProps<T>) => {
  const handlePress = useCallback(() => onPress(id), [onPress, id]);

  return <ListRow title={title} subtitle={description} onPress={handlePress} />;
};

export const ShowcaseLinkRow = memo(
  ShowcaseLinkRowComponent,
) as typeof ShowcaseLinkRowComponent;
