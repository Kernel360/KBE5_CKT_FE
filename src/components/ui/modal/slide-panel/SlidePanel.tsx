import React, { useEffect, useRef } from 'react';
import { Overlay, PanelContainer, PanelHeader, HeaderActionsContainer, PanelContent } from './SlidePanel.styles';
import type { SlidePanelProps } from './types';

import { getScrollbarWidth } from '@/utils/scroll';
import ActionButton from '@/components/ui/button/ActionButton';

import IconClose from '@/assets/icons/ic-close.svg?react';

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  width = '550px',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  /**
   * 패널의 열림/닫힘 상태에 따라 body 스크롤을 제어합니다.
   * 스크롤 위치를 저장하고 복원하며, 레이아웃 점프를 방지합니다.
   */
  useEffect(() => {
    const scrollbarWidth = getScrollbarWidth();

    if (isOpen) {
      scrollPositionRef.current = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollPositionRef.current);
    }

    return () => {
      if (document.body.style.overflow === 'hidden' && document.body.style.position === 'fixed') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && <Overlay onClick={onClose} />}
      <PanelContainer $isOpen={isOpen} $width={width} ref={panelRef}>
        <PanelHeader>
          {title && <h2>{title}</h2>}
          <HeaderActionsContainer>
            {actions}
            <ActionButton icon={<IconClose />} buttonType="gray" onClick={onClose} aria-label="닫기" />
          </HeaderActionsContainer>
        </PanelHeader>
        <PanelContent>{children}</PanelContent>
      </PanelContainer>
    </>
  );
};
