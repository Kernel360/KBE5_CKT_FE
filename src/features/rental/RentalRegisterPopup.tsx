import { useCallback } from 'react';

import { BasicButton } from '@/components/ui/button/BasicButton';
import { Popup } from '@/components/ui/modal/popup/Popup';
import { Text } from '@/components/ui/text/Text';
import { TextArea } from '@/components/ui/input/textarea/TextArea';

import { FormFieldWrapper, FormRow, FormSection, MemoSection } from './RentalRegisterPopup.styles';
import { useRentalRegister } from './hooks/useRentalRegister';

// --- RentalRegisterPopup 컴포넌트의 props 인터페이스 정의 ---
interface RentalRegisterPopupProps {
  isOpen: boolean; // 팝업이 현재 열려 있는지 여부
  onClose: (success?: boolean) => void; // 팝업이 닫힐 때 호출될 콜백 함수 (등록 성공 여부 전달)
}

/**
 * 예약 등록을 위한 팝업 컴포넌트입니다.
 * 사용자로부터 예약 정보를 입력받아 등록 처리하며, `useRentalRegister` 훅을 통해 폼 로직을 관리합니다.
 */

export const RentalRegisterPopup: React.FC<RentalRegisterPopupProps> = ({ isOpen, onClose }) => {
  // -----------------------------------------------------------------------
  // 🚀 폼 관련 상태 및 함수 가져오기 (useRentalRegister 훅 활용)
  // -----------------------------------------------------------------------
  const { formData, errors, handleInputChange, handleSubmit, resetForm } = useRentalRegister();

  // -----------------------------------------------------------------------
  // 핸들러 함수들
  // -----------------------------------------------------------------------

  /**
   * '등록' 버튼 클릭 시 호출되는 핸들러 함수.
   * 폼 유효성 검사 후 데이터 제출을 시도하고, 성공 시 폼을 리셋하고 팝업을 닫습니다.
   */
  const handleRegister = useCallback(async () => {
    const isSuccess = await handleSubmit();
    if (isSuccess) {
      resetForm();
      onClose(true);
    }
  }, [handleSubmit, resetForm, onClose]);

  /**
   * '취소' 버튼 클릭 시 또는 팝업 외부 영역 클릭 시 호출되는 핸들러 함수.
   * 폼을 리셋하고 팝업을 닫습니다. (등록 실패/취소로 간주)
   */
  const handleCancel = useCallback(() => {
    resetForm();
    onClose(false);
  }, [resetForm, onClose]);

  // --- 팝업 하단에 표시될 액션 버튼들 ---
  const popupActionButtons = (
    <>
      <BasicButton buttonType="basic" onClick={handleCancel}>
        취소
      </BasicButton>
      <BasicButton buttonType="primary" onClick={handleRegister}>
        등록
      </BasicButton>
    </>
  );

  // -----------------------------------------------------------------------
  // 렌더링
  // -----------------------------------------------------------------------
  return (
    <Popup isOpen={isOpen} onClose={handleCancel} title="예약 등록" actionButtons={popupActionButtons}>
      {/* --- 기본 정보 섹션 --- */}
      <FormSection>
        <Text type="subheading2">기본 정보</Text>
        <FormRow>
          <FormFieldWrapper>차량 검색</FormFieldWrapper>
          <FormFieldWrapper>사용자 검색</FormFieldWrapper>
          <FormFieldWrapper>픽업 일자</FormFieldWrapper>
          <FormFieldWrapper>반납 일자</FormFieldWrapper>
        </FormRow>
      </FormSection>

      {/* --- 추가 정보 섹션 --- */}
      <FormSection>
        <Text type="subheading2">추가 정보</Text>
        <MemoSection>
          <TextArea
            id="memo"
            label="특이사항"
            placeholder="차량에 대한 특이사항을 입력하세요"
            onChange={value => handleInputChange('memo', value)}
            value={formData.memo}
            minHeight="120px"
          />
        </MemoSection>
      </FormSection>
    </Popup>
  );
};
