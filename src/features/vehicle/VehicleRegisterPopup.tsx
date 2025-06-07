import React, { useCallback } from 'react';

import { Popup } from '@/components/ui/modal/popup/Popup';
import { Text } from '@/components/ui/text/Text';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { BasicButton } from '@/components/ui/button/BasicButton';
import { TextArea } from '@/components/ui/input/textarea/TextArea';

import { FormRow, FormSection, FormFieldWrapper, MemoSection } from './VehicleRegisterPopup.styles';

import { useVehicleRegister } from './hooks/useVehicleRegister';
import { FUEL_TYPE_OPTIONS, TRANSMISSION_TYPE_OPTIONS } from './types';

// --- VehicleRegisterPopup 컴포넌트의 props 인터페이스 정의 ---
interface VehicleRegisterPopupProps {
  isOpen: boolean; // 팝업이 현재 열려 있는지 여부
  onClose: (success?: boolean) => void; // 팝업이 닫힐 때 호출될 콜백 함수 (등록 성공 여부 전달)
}

/**
 * 차량 등록을 위한 팝업 컴포넌트입니다.
 * 사용자로부터 차량 정보를 입력받아 등록 처리하며, `useVehicleRegister` 훅을 통해 폼 로직을 관리합니다.
 */
export const VehicleRegisterPopup: React.FC<VehicleRegisterPopupProps> = ({ isOpen, onClose }) => {
  // -----------------------------------------------------------------------
  // 🚀 폼 관련 상태 및 함수 가져오기 (useVehicleList 훅 활용)
  // -----------------------------------------------------------------------
  const { formData, errors, handleInputChange, handleSubmit, resetForm } = useVehicleRegister();

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
    <Popup isOpen={isOpen} onClose={handleCancel} title="차량 등록" actionButtons={popupActionButtons}>
      {/* --- 기본 정보 섹션 --- */}
      <FormSection>
        <Text type="subheading2">기본 정보</Text>
        <FormRow>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="registrationNumber"
              label="차량 번호"
              placeholder="예: 12가 3456"
              onChange={value => handleInputChange('registrationNumber', value)}
              value={formData.registrationNumber}
              onEnter={handleRegister}
              autoFocus
              required={true}
              maxLength={10}
              errorText={errors.registrationNumber}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="modelYear"
              label="연식"
              placeholder="예: 2025"
              onChange={value => handleInputChange('modelYear', value)}
              value={formData.modelYear}
              onEnter={handleRegister}
              required={true}
              maxLength={4}
              errorText={errors.modelYear}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="manufacturer"
              label="제조사"
              placeholder="예: 기아"
              onChange={value => handleInputChange('manufacturer', value)}
              value={formData.manufacturer}
              onEnter={handleRegister}
              required={true}
              maxLength={20}
              errorText={errors.manufacturer}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="modelName"
              label="모델명"
              placeholder="예: 아반떼"
              onChange={value => handleInputChange('modelName', value)}
              value={formData.modelName}
              onEnter={handleRegister}
              required={true}
              maxLength={20}
              errorText={errors.modelName}
            />
          </FormFieldWrapper>
        </FormRow>
      </FormSection>

      {/* --- 기술 정보 섹션 --- */}
      <FormSection>
        <Text type="subheading2">기술 정보</Text>
        <FormRow>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="batteryVoltage"
              label="배터리 전력(kWh)"
              placeholder="예: 64"
              onChange={value => handleInputChange('batteryVoltage', value)}
              value={formData.batteryVoltage}
              onEnter={handleRegister}
              maxLength={4}
              errorText={errors.batteryVoltage}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <Dropdown
              id="fuelType"
              label="연료 유형"
              options={FUEL_TYPE_OPTIONS}
              onSelect={value => handleInputChange('fuelType', value.toString())}
              value={formData.fuelType}
              required={true}
              errorText={errors.fuelType}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <Dropdown
              id="transmissionType"
              label="변속기"
              options={TRANSMISSION_TYPE_OPTIONS}
              onSelect={value => handleInputChange('transmissionType', value.toString())}
              value={formData.transmissionType}
              required={true}
              errorText={errors.transmissionType}
            />
          </FormFieldWrapper>
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
