import React, { useState, useCallback, useEffect, memo } from 'react';

import { FieldContainer, StyledLabel, InputWrapper, StyledInput, IconContainer } from './TextInput.styles';
import type { TextInputProps } from './types';
import { Text } from '@/components/ui/text/Text';

export const TextInput: React.FC<TextInputProps> = memo(
  ({
    id,
    width,
    label,
    icon,
    value,
    errorText,
    disabled = false,
    readOnly = false,
    required = false,
    onFocus,
    onBlur,
    onChange,
    onEnter,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [displayValue, setDisplayValue] = useState<string>(value);

    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
          return;
        }
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus, disabled, readOnly]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
          return;
        }
        const newValue = e.target.value;
        setDisplayValue(newValue);
        onChange?.(newValue);
      },
      [onChange, disabled, readOnly]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
          return;
        }
        if (e.key === 'Enter') {
          onEnter?.(displayValue);
        }
      },
      [disabled, readOnly, onEnter, displayValue]
    );

    const isError = !!errorText;

    return (
      <FieldContainer $width={width}>
        {label && (
          <StyledLabel htmlFor={id}>
            <Text type="label">
              {label}
              {required && <span style={{ color: 'var(--color-red)', marginLeft: '4px' }}>*</span>}
            </Text>
          </StyledLabel>
        )}
        <InputWrapper
          $isFocused={isFocused}
          $hasIcon={!!icon}
          $isDisabled={disabled}
          $isReadOnly={readOnly}
          $isError={isError}
        >
          <StyledInput
            id={id}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            value={displayValue}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete="off"
            {...props}
          />
          {icon && <IconContainer>{icon}</IconContainer>}
        </InputWrapper>
        {isError && (
          <Text type="error" style={{ marginLeft: '4px' }}>
            {' '}
            {errorText}
          </Text>
        )}
      </FieldContainer>
    );
  }
);

TextInput.displayName = 'TextInput';
