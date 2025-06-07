import React, { useState, useCallback, useRef, useEffect, memo } from 'react';

import { FieldContainer, StyledLabel, InputWrapper, StyledTextArea } from './TextAres.styles';
import type { TextAreaProps } from './types';
import { Text } from '@/components/ui/text/Text';

export const TextArea: React.FC<TextAreaProps> = memo(
  ({
    label,
    disabled = false,
    readOnly = false,
    onFocus,
    onBlur,
    onChange,
    value = '',
    id,
    width,
    minHeight = '80px',
    maxHeight,
    required = false,
    errorText,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(value as string);
    const isInitialRender = useRef(true);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // value가 변경될 때마다 currentValue를 업데이트 (초기 렌더링 시에만)
    useEffect(() => {
      if (isInitialRender.current) {
        setCurrentValue(value as string);
        isInitialRender.current = false;
      }
    }, [value]);

    // 컴포넌트 언마운트 시 디바운스 타이머 클리어
    useEffect(() => {
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, []);

    // focus 이벤트 핸들러
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (disabled || readOnly) {
          return;
        }
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus, disabled, readOnly]
    );

    // blur 이벤트 핸들러
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(e);
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
      },
      [onBlur]
    );

    // input 변경 이벤트 핸들러 (디바운스 적용)
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (disabled || readOnly) {
          return;
        }
        const newValue = e.target.value;
        setCurrentValue(newValue);

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          onChange?.(newValue);
        }, 100);
      },
      [onChange, disabled, readOnly]
    );

    const isError = !!errorText; // 에러 텍스트가 있으면 true

    return (
      <FieldContainer $width={width} $minHeight={minHeight} $maxHeight={maxHeight}>
        {label && (
          <StyledLabel htmlFor={id}>
            <Text type="label">
              {label}
              {required && <span style={{ color: 'var(--color-red)', marginLeft: '4px' }}>*</span>}
            </Text>
          </StyledLabel>
        )}
        <InputWrapper $isFocused={isFocused} $isDisabled={disabled} $isReadOnly={readOnly} $isError={isError}>
          <StyledTextArea
            id={id}
            ref={textAreaRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />
        </InputWrapper>
        {isError && (
          <Text type="error" style={{ marginLeft: '4px' }}>
            {errorText}
          </Text>
        )}
      </FieldContainer>
    );
  }
);

TextArea.displayName = 'TextArea';
