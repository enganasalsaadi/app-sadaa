import React, { memo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme, useStyles, moderateScale } from '@/core/theme';
import { Layout } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { useGetConfigQuery } from '@/core/api';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import type { SettingsStackScreenProps } from '@/core/navigation';

type Props = SettingsStackScreenProps<'WebViewScreen'>;

const WebViewScreenComponent: React.FC<Props> = ({ route }) => {
  const { title, url } = route.params;
  const { colors } = useTheme();
  const styles = useStyles(({ colors: c }) => ({
    webView: { flex: 1, backgroundColor: c.layout.base },
    loader: {
      position: 'absolute' as const,
      top: moderateScale(80),
      start: 0,
      end: 0,
      alignItems: 'center' as const,
    },
  }));
  const [loading, setLoading] = useState(true);
  useHideBottomBar();

  const { data: config } = useGetConfigQuery();

  const resolvedUrl =
    url === '__terms__'
      ? config?.urls.terms ?? ''
      : url === '__privacy__'
        ? config?.urls.privacy ?? ''
        : url;

  return (
    <Layout
      withGradient={false}
      withScroll={false}
      contentPadding={false}
      screenHeader={{
        title,
        fillStatusBar: true,
      }}
    >
      {resolvedUrl ? (
        <>
          <WebView
            source={{ uri: resolvedUrl }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <Box style={styles.loader}>
              <ActivityIndicator color={colors.interactive.main} />
            </Box>
          )}
        </>
      ) : (
        <Box flex={1} align="center" justify="center">
          <ActivityIndicator color={colors.interactive.main} />
        </Box>
      )}
    </Layout>
  );
};

export const WebViewScreen = memo(WebViewScreenComponent);
