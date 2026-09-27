import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { ListEmptyState } from '../ListEmptyState';

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
      return <ListEmptyState isError onRetry={this.retry} />;
    }
    return this.props.children;
  }
}
