import styled, { css } from 'styled-components';
import type { FieldContainerProps, InputWrapperProps } from './types';

export const FieldContainer = styled.div<FieldContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: ${({ $width }) => $width || '200px'};
  ${({ $minHeight }) => $minHeight && `min-height: ${$minHeight};`}
  ${({ $maxHeight }) => $maxHeight && `max-height: ${$maxHeight};`}
`;

// 기존 StyledLabel은 <Text> 컴포넌트로 대체되므로 삭제
export const StyledLabel = styled.label`
  user-select: none;
`;

export const InputWrapper = styled.div<InputWrapperProps>`
  display: flex;
  align-self: stretch;
  width: 100%;
  /* height: 40px; 제거됨 */
  padding: 8px 12px;
  background: var(--color-white);
  border-radius: 6px;
  outline: 1px var(--color-gray400) solid; /* 기본 테두리 색상 */
  outline-offset: -1px;
  transition:
    outline-color 0.2s ease,
    outline 0.2s ease;
  cursor: text;

  ${({ $isFocused }) =>
    $isFocused &&
    css`
      outline: 1px var(--color-primary) solid;
      outline-offset: -1px;
    `}

  ${({ $isError }) =>
    $isError &&
    css`
      outline: 1px var(--color-red) solid; /* 에러 시 빨간 테두리 */
      outline-offset: -1px;
    `}

  ${({ $isDisabled }) =>
    $isDisabled &&
    css`
      background: var(--color-gray200);
      cursor: not-allowed;
      ${StyledTextArea} {
        color: var(--color-gray600);
        cursor: not-allowed;
      }
      &::placeholder {
        color: var(--color-gray600);
      }
      &:focus-within {
        outline: 1px var(--color-gray400) solid;
      }
    `}

  ${({ $isReadOnly }) =>
    $isReadOnly &&
    css`
      background: var(--color-white);
      cursor: not-allowed;
      ${StyledTextArea} {
        color: var(--color-gray900);
        cursor: not-allowed;
      }
      &:focus-within {
        outline: 1px var(--color-gray400) solid;
      }
    `}

  ${({ $isDisabled, $isReadOnly }) =>
    ($isDisabled || $isReadOnly) &&
    css`
      ${StyledTextArea} {
        pointer-events: none;
      }
    `}
`;

export const StyledTextArea = styled.textarea`
  flex: 1;
  width: 100%;
  height: auto;
  min-height: 64px;
  resize: none; /* 크기 조절 방지 */
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-gray900);
  box-sizing: border-box;

  &::placeholder {
    color: var(--color-gray600);
  }

  &:disabled,
  &:read-only {
    cursor: not-allowed;
  }
`;
