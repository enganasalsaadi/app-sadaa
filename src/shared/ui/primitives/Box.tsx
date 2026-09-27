import React, { memo } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import type { BoxStyleProps } from './boxStyle';
import { splitBoxStyleProps, useBoxStyle } from './boxStyle';

export interface BoxProps extends ViewProps, BoxStyleProps {}

const BoxComponent: React.FC<BoxProps> = ({ style, children, ...props }) => {
  const { styleProps, rest } = splitBoxStyleProps(props);
  const computedStyle = useBoxStyle(styleProps);

  return (
    <View style={[computedStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export const Box = memo(BoxComponent);
