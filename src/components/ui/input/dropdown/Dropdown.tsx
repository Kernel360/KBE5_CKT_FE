import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import {
  SelectedValueText,
  DropdownIcon,
  StyledDropdownContainer,
  OptionsList,
  OptionItem,
  FieldContainer,
  StyledLabel,
} from './Dropdown.styles';
import type { DropdownOption, DropdownProps } from './types';
import { Text } from '@/components/ui/text/Text';

import DropdownArrowIcon from '@/assets/icons/ic-dropdown.svg?react';

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  options,
  value,
  placeholder = '전체',
  onSelect,
  width,
  disabled = false,
  readOnly = false,
  required = false,
  errorText,
}) => {
  const [displayLabel, setDisplayLabel] = useState<string | undefined>(() => {
    return value ? options.find(opt => opt.value === value)?.label : placeholder;
  });

  const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsListRef = useRef<HTMLUListElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

  const isDisabledOrReadOnly = disabled || readOnly;
  const isError = !!errorText;

  // 외부 클릭 감지 (드롭다운 닫기)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        optionsListRef.current &&
        !optionsListRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // value, options, placeholder 변경 시 displayLabel 및 selectedValue 업데이트
  useEffect(() => {
    const newDisplayLabel = value ? options.find(opt => opt.value === value)?.label : placeholder;
    setSelectedValue(value);
    setDisplayLabel(newDisplayLabel);
  }, [value, options, placeholder]);

  // 드롭다운 토글 및 위치 정보 저장
  const handleToggle = useCallback(() => {
    if (!isDisabledOrReadOnly) {
      setIsOpen(prev => {
        if (!prev && dropdownRef.current) {
          setDropdownRect(dropdownRef.current.getBoundingClientRect());
        }
        return !prev;
      });
    }
  }, [isDisabledOrReadOnly]);

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const updatePosition = () => {
      if (dropdownRef.current) {
        setDropdownRect(dropdownRef.current.getBoundingClientRect());
      }
    };

    // 스크롤과 리사이즈 이벤트에 리스너 추가
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const handleSelectOption = useCallback(
    (option: DropdownOption) => {
      if (isDisabledOrReadOnly) return;

      setSelectedValue(option.value);
      setDisplayLabel(option.label);
      setIsOpen(false);
      if (onSelect) {
        onSelect(option.value);
      }
    },
    [onSelect, isDisabledOrReadOnly]
  );

  const portalRoot = document.body;

  return (
    <FieldContainer $width={width}>
      {label && (
        <StyledLabel htmlFor={id || `dropdown-${Math.random().toString(36).substr(2, 9)}`}>
          <Text type="label">
            {label}
            {required && <span style={{ color: 'var(--color-red)', marginLeft: '4px' }}>*</span>}
          </Text>
        </StyledLabel>
      )}
      <StyledDropdownContainer
        ref={dropdownRef}
        onClick={handleToggle}
        $width={width}
        $isDisabledOrReadOnly={isDisabledOrReadOnly}
        $isOpen={isOpen}
        $isError={isError}
        tabIndex={isDisabledOrReadOnly ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        id={id}
      >
        <SelectedValueText>{displayLabel}</SelectedValueText>
        <DropdownIcon $isOpen={isOpen}>
          <DropdownArrowIcon />
        </DropdownIcon>
      </StyledDropdownContainer>

      {isOpen &&
        dropdownRect &&
        createPortal(
          <OptionsList
            ref={optionsListRef}
            role="listbox"
            style={{
              position: 'absolute',
              top: dropdownRect.bottom + window.scrollY - 10,
              left: dropdownRect.left + window.scrollX,
              width: dropdownRect.width,
              zIndex: 1000,
            }}
          >
            {options.map(option => (
              <OptionItem
                key={option.value}
                onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                  e.stopPropagation();
                  handleSelectOption(option);
                }}
                role="option"
                aria-selected={option.value === selectedValue}
              >
                {option.label}
              </OptionItem>
            ))}
          </OptionsList>,
          portalRoot
        )}
      {isError && (
        <Text type="error" style={{ marginLeft: '4px' }}>
          {errorText}
        </Text>
      )}
    </FieldContainer>
  );
};

Dropdown.displayName = 'Dropdown';
