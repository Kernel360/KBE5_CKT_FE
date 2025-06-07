import type React from 'react';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  width?: string;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
  value: string;
  errorText?: string;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
}

export interface FieldContainerProps {
  $width?: string;
}

export interface InputWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  $hasIcon: boolean;
  $isFocused: boolean;
  $isError: boolean;
  $isDisabled: boolean;
  $isReadOnly: boolean;
}
