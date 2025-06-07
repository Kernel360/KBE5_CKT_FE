import React from 'react';

import { BasicButton } from '@/components/ui/button/BasicButton';
import { Text } from '@/components/ui/text/Text';

import type { ConfirmDialogProps } from './types';
import { ButtonGroup, ContentWrapper, DialogContainer, Overlay, TitleWrapper } from './ConfirmDialog.styles';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  hideCancelButton = false,
}) => {
  return (
    <Overlay>
      <DialogContainer>
        <TitleWrapper>
          <Text type="subheading">{title}</Text>
        </TitleWrapper>
        <ContentWrapper>
          <Text type="body1">{content}</Text>
        </ContentWrapper>
        <ButtonGroup>
          {!hideCancelButton && (
            <BasicButton onClick={onCancel} buttonType="basic">
              {cancelText}
            </BasicButton>
          )}
          <BasicButton onClick={onConfirm} buttonType="primary">
            {confirmText}
          </BasicButton>
        </ButtonGroup>
      </DialogContainer>
    </Overlay>
  );
};
