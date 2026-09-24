import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { CustomButton } from '../../../CustomButton';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
       
      console.error('[SuperList ErrorBoundary]', error, info.componentStack);
    }
  }

  retry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }
      return <DefaultFallback retry={this.retry} />;
    }
    return this.props.children;
  }
}

const DefaultFallback: React.FC<{ retry: () => void }> = ({ retry }) => {
  const { t } = useTranslation();

  return (
    <Box flex={1} align="center" justify="center" p="2xl">
      <Text variant="body" align="center">
        {t('errors.generic')}
      </Text>
      <Box mt="lg" width={160}>
        <CustomButton title={t('common.retry')} onPress={retry} size="sm" />
      </Box>
    </Box>
  );
};
