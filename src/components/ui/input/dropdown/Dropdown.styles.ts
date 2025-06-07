import styled, { css } from 'styled-components';
import type { FieldContainerProps, StyledDropdownContainerProps, DropdownIconProps } from './types';

export const FieldContainer = styled.div<FieldContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: ${({ $width }) => $width || '200px'};
`;

export const StyledLabel = styled.label`
  user-select: none;
`;

export const SelectedValueText = styled.span`
  color: var(--color-gray900);
  font-size: 14px;
  font-weight: 400;
  line-height: 16.8px;
  word-wrap: break-word;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;

export const DropdownIcon = styled.div<DropdownIconProps>`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease-in-out;
`;

export const StyledDropdownContainer = styled.div<StyledDropdownContainerProps>`
  min-width: ${({ $width }) => $width || '200px'};
  height: 40px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  background: var(--color-white);
  outline: 1px var(--color-gray400) solid; /* 기본 테두리 색상 */
  outline-offset: -1px;
  transition:
    outline-color 0.2s ease,
    outline 0.2s ease; /* transition 추가 */
  cursor: pointer;

  /*
    1. 비활성화/읽기 전용 상태가 아닌 경우에만 에러/포커스/호버 스타일 적용
    2. 비활성화/읽기 전용 상태일 때는 항상 고정된 스타일 유지
  */
  ${({ $isDisabledOrReadOnly, $isError, $isOpen }) =>
    // 비활성화 또는 읽기 전용 상태일 때
    $isDisabledOrReadOnly
      ? css`
          background: var(--color-gray200);
          color: var(--color-gray600);
          cursor: not-allowed;
          outline: 1px var(--color-gray400) solid; /* 이 상태에서는 항상 회색 테두리 */
          ${SelectedValueText} {
            color: var(--color-gray600);
          }
          ${DropdownIcon} {
            cursor: not-allowed;
          }
          &:focus-within,
          &:hover {
            outline: 1px var(--color-gray400) solid; /* 포커스/호버 시에도 고정 */
          }
        `
      : // 비활성화 또는 읽기 전용 상태가 아닐 때
        css`
          /* 에러 상태 스타일 (최우선 적용) */
          ${$isError &&
          css`
            outline: 1px var(--color-red) solid;
            outline-offset: -1px;
          `}

          /* 드롭다운이 열린 상태 또는 포커스 시 스타일 */
          ${$isOpen
            ? // 드롭다운이 열렸을 때 (에러가 아니면 primary 색상)
              css`
                outline: 1px ${$isError ? 'var(--color-red)' : 'var(--color-primary)'} solid;
                outline-offset: -1px;
              `
            : // 드롭다운이 닫혔고, 에러가 아니면 포커스 시 primary 색상
              css`
                &:focus-within {
                  outline: 1px ${$isError ? 'var(--color-red)' : 'var(--color-primary)'} solid;
                  outline-offset: -1px;
                }
              `}
        `}
`;

export const OptionsList = styled.ul`
  background: var(--color-white);
  border: 1px var(--color-gray400) solid;
  border-radius: 6px;
  padding: 0;
  list-style: none;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto; /* 필요한 경우 유지 */
  user-select: none;

  /* WebKit (Chrome, Safari) */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.4);
  }
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
`;

export const OptionItem = styled.li`
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 400;
  line-height: 16.8px;
  color: var(--color-gray900);
  cursor: pointer;

  &:hover {
    background: var(--color-primaryLight);
    color: var(--color-primaryDark);
  }

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;
