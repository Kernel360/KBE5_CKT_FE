import type React from 'react';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  width?: string;
  minHeight?: string;
  maxHeight?: string;
  label?: string;
  value?: string;
  errorText?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

export interface FieldContainerProps {
  $width?: string;
  $minHeight?: string; // TextArea를 위한 FieldContainer의 최소 높이
  $maxHeight?: string; // TextArea를 위한 FieldContainer의 최대 높이
}

export interface InputWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  $isFocused: boolean;
  $isError: bollean;
  $isDisabled: boolean;
  $isReadOnly: boolean;
}
