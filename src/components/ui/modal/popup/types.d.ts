import React from 'react';

export interface BasicPopupProps {
  /** 팝업이 열려있는지 여부 */
  isOpen: boolean;
  /** 팝업을 닫는 함수 */
  onClose: () => void;
  /** 팝업 헤더에 표시될 타이틀 */
  title: string;
  /** 팝업의 메인 콘텐츠 영역 */
  children: React.ReactNode;
  /** 팝업 하단에 표시될 액션 버튼 영역 (선택 사항) */
  actionButtons?: React.ReactNode;
}
