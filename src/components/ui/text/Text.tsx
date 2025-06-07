import React from 'react';

import {
  BaseSpan,
  HeadingText,
  Heading2Text,
  SubheadingText,
  Subheading2Text,
  Body2Text,
  LabelText,
  PlaceholderText,
  ErrorText,
} from './Text.styles';
import type { TextProps } from './types';

export const Text: React.FC<TextProps> = ({ type = 'body1', children, ...props }) => {
  switch (type) {
    case 'heading':
      return <HeadingText {...props}>{children}</HeadingText>;
    case 'heading2':
      return <Heading2Text {...props}>{children}</Heading2Text>;
    case 'subheading':
      return <SubheadingText {...props}>{children}</SubheadingText>;
    case 'subheading2':
      return <Subheading2Text {...props}>{children}</Subheading2Text>;
    case 'label':
      return <LabelText {...props}>{children}</LabelText>;
    case 'placeholder':
      return <PlaceholderText {...props}>{children}</PlaceholderText>;
    case 'error':
      return <ErrorText {...props}>{children}</ErrorText>;
    case 'body2':
      return <Body2Text {...props}>{children}</Body2Text>;
    case 'body1':
    default:
      return <BaseSpan {...props}>{children}</BaseSpan>;
  }
};
