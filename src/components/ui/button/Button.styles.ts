import styled, { css } from 'styled-components';
import type { StyledActionButtonProps, StyledBasicButtonProps, StyledIconButtonProps } from './types';

// --- 공통 버튼 스타일 ---
export const CommonButtonStyles = `
  word-wrap: break-word;
  border-radius: 6px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  line-height: 16.8px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.1s ease;
  user-select: none;

  &:active {
    transform: scale(0.98);
  }
`;

// --- 기본 버튼 Styled Component ---
export const StyledBasicButton = styled.button<StyledBasicButtonProps>`
  ${CommonButtonStyles}

  width: ${props => props.width || 'auto'};

  /* 버튼 타입에 따른 컬러 스타일 */
  ${props => {
    switch (props.$buttonType) {
      case 'gray':
        return css`
          background: var(--color-gray400);
          color: var(--color-gray600);
          &:hover {
            background: var(--color-gray500);
          }
        `;
      case 'red':
        return css`
          background: var(--color-red);
          color: var(--color-white);
          &:hover {
            background: var(--color-redDark);
          }
        `;
      case 'basic':
        return css`
          background: var(--color-white);
          color: var(--color-gray700);
          outline: 1px var(--color-gray400) solid;
          outline-offset: -1px;
          &:hover {
            background: var(--color-gray300);
            outline: 1px solid var(--color-gray400);
          }
        `;
      case 'primary':
      default:
        return css`
          background: var(--color-primary);
          color: var(--color-white);
          &:hover {
            background: var(--color-primaryDark);
          }
        `;
    }
  }}
`;

// --- 아이콘 버튼 Styled Component ---
export const StyledIconButton = styled.button<StyledIconButtonProps>`
  ${CommonButtonStyles}
  width: ${props => props.width || 'auto'};
  background: var(--color-primary);
  color: var(--color-white);

  &:hover {
    background: var(--color-primaryDark);
  }

  gap: 8px;

  ${props =>
    props.$iconPosition === 'right' &&
    `
    flex-direction: row-reverse;
  `}

  // ICON 중앙 정렬
  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // ICON 기본 크기 유지
  span:first-child {
    flex-shrink: 0;
    flex-basis: auto;
  }
`;

export const StyledActionButton = styled.button<StyledActionButtonProps>`
  width: 32px;
  height: 32px;
  padding: 8px;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 버튼 타입에 따른 컬러 스타일 */
  ${({ $buttonType }) => {
    switch ($buttonType) {
      case 'primary':
        return css`
          background: var(--color-primary);
          color: var(--color-white);
          &:hover {
            background: var(--color-primaryDark);
          }
        `;
      case 'gray':
        return css`
          background: var(--color-gray200);
          color: var(--color-gray600);
          &:hover {
            background: var(--color-gray300);
          }
        `;
      default:
        return css`
          background: var(--color-primary);
          color: var(--color-white);
          &:hover {
            background: var(--color-primaryDark);
          }
        `;
    }
  }}

  /* children으로 전달된 SVG 아이콘에 대한 스타일 */
  & svg {
    display: block;
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: currentColor;
  }
`;
