import React from 'react';
import { AnimatePresence } from 'framer-motion';

import { Overlay, PopupContainer, Header, ContentWrapper, ActionButtonsWrapper } from './Popup.styles';
import type { BasicPopupProps } from './types';

import { Text } from '@/components/ui/text/Text';
import ActionButton from '@/components/ui/button/ActionButton';

import IconClose from '@/assets/icons/ic-close.svg?react';

export const Popup: React.FC<BasicPopupProps> = ({ isOpen, onClose, title, children, actionButtons }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <PopupContainer
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <Header>
              <Text type="heading2">{title}</Text>
              <ActionButton icon={<IconClose />} buttonType="gray" onClick={onClose} aria-label="닫기" />
            </Header>

            <ContentWrapper>{children}</ContentWrapper>

            {actionButtons && <ActionButtonsWrapper>{actionButtons}</ActionButtonsWrapper>}
          </PopupContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
