import React from 'react';
import { HTMLMotionProps } from 'framer-motion';

/**
 * Text 컴포넌트의 props 정의
 */
export interface TextProps extends HTMLMotionProps<'span'> {
  type?:
    | 'heading'
    | 'heading2'
    | 'subheading'
    | 'subheading2'
    | 'label'
    | 'body1'
    | 'body2'
    | 'placeholder'
    | 'error'
    | 'button'
    | 'secondaryButton';
  children: React.ReactNode;
}
