import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SearchBar } from '@/shared/ui';
import { useSearchBarDemo } from './hooks/useSearchBarDemo';

const SearchBarDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useSearchBarDemo();

  return (
    <Box gap="lg">
      <SearchBar
        value={demo.query}
        onChangeText={demo.setQuery}
        onSubmit={demo.submit}
        loading={demo.loading}
        placeholder={t('devShowcase.searchBar.placeholder')}
      />
    </Box>
  );
};

export const SearchBarDemo = memo(SearchBarDemoComponent);
