import { useState, useCallback } from 'react';
import { useLoading } from '@/context/LoadingContext';
import { toast } from 'react-toastify';

import type { VehicleFormData, VehicleFormErrors, UseVehicleRegisterReturn } from '../types';
import { registerVehicle } from '../api/vehicle-api';
import { DUPLICATE_REGISTRATION_NUMBER_CODE } from '../errors';
import { APIError } from '@/utils/response';

/**
 * 차량 등록 폼의 데이터, 유효성 검사, 제출 로직을 추상화한 커스텀 훅입니다.
 * 폼 데이터 상태, 에러 상태를 관리하고, 입력 변경, 유효성 검사, 제출 기능을 제공합니다.
 * @returns {UseVehicleRegisterReturn} 폼 데이터, 에러, 관련 핸들러 함수들을 포함하는 객체
 */
export const useVehicleRegister = (): UseVehicleRegisterReturn => {
  // --- 로딩 스피너 컨텍스트 훅 사용 ---
  const { showLoading, hideLoading } = useLoading();

  // --- 폼 데이터 상태 관리 ---
  // 차량 등록 폼의 모든 입력 필드 값을 저장합니다. 초기값은 빈 문자열입니다.
  const [formData, setFormData] = useState<VehicleFormData>({
    registrationNumber: '',
    modelYear: '',
    manufacturer: '',
    modelName: '',
    batteryVoltage: '',
    fuelType: '',
    transmissionType: '',
    memo: '',
  });

  // --- 폼 에러 상태 관리 ---
  // 각 입력 필드에 대한 유효성 검사 에러 메시지를 저장합니다.
  const [errors, setErrors] = useState<VehicleFormErrors>({});

  // --- 핸들러 함수 정의 ---

  /**
   * 입력 필드의 값이 변경될 때 호출되는 핸들러 함수입니다.
   * 해당 필드의 `formData` 값을 업데이트하고, 해당 필드의 기존 에러 메시지를 제거합니다.
   * @param id 변경된 입력 필드의 ID (즉, `formData` 객체의 키)
   * @param value 변경된 입력 필드의 새 값
   */
  const handleInputChange = useCallback((id: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value })); // 특정 필드 값 업데이트
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id]; // 해당 필드의 에러 메시지 제거
      return newErrors;
    });
  }, []); // 이 함수는 의존성이 없으므로 마운트 시 한 번만 생성됩니다.

  /**
   * 현재 폼 데이터의 유효성을 검사합니다.
   * 각 필수 필드 및 형식에 대한 유효성 규칙을 적용하고, 위반 시 `errors` 상태를 업데이트합니다.
   * @returns 폼의 모든 필드가 유효하면 `true`, 하나라도 유효하지 않으면 `false`
   */
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: VehicleFormErrors = {};

    // 차량 번호 필드의 유효성 검사
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = '차량 번호를 입력해주세요.';
      isValid = false;
    } else if (!/^\d{2,3}[가-힣]{1}\d{4}$/.test(formData.registrationNumber)) {
      newErrors.registrationNumber = '차량 번호 형식이 올바르지 않습니다.';
      isValid = false;
    }

    // 연식 필드의 유효성 검사
    if (!formData.modelYear.trim()) {
      newErrors.modelYear = '연식을 입력해주세요.';
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.modelYear)) {
      newErrors.modelYear = '연식은 4자리 숫자로 입력해야 합니다. (예: 2025)';
      isValid = false;
    }

    // 제조사 필드의 유효성 검사
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = '제조사를 입력해주세요.';
      isValid = false;
    }

    // 모델명 필드의 유효성 검사
    if (!formData.modelName.trim()) {
      newErrors.modelName = '모델명을 입력해주세요.';
      isValid = false;
    }

    // 배터리 전력 필드의 유효성 검사 (선택 사항이지만, 입력 시 숫자만 허용)
    if (formData.batteryVoltage && !/^\d+$/.test(formData.batteryVoltage)) {
      newErrors.batteryVoltage = '배터리 전력은 숫자만 입력 가능합니다.';
      isValid = false;
    }

    // 연료 유형 필드의 유효성 검사 (드롭다운 선택)
    if (!formData.fuelType) {
      newErrors.fuelType = '연료 유형을 선택해주세요.';
      isValid = false;
    }

    // 변속기 유형 필드의 유효성 검사 (드롭다운 선택)
    if (!formData.transmissionType) {
      newErrors.transmissionType = '변속기를 선택해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  /**
   * 폼 제출을 처리하는 비동기 함수입니다.
   * 폼 유효성 검사를 먼저 수행하고, 유효한 경우 차량 등록 API를 호출합니다.
   * API 호출 전후로 로딩 스피너를 표시하며, 성공/실패 시 사용자에게 토스트 알림을 제공합니다.
   * @returns 등록 작업의 성공 여부를 나타내는 `boolean` 값
   */
  const handleSubmit = useCallback(async () => {
    const isValid = validateForm();
    if (!isValid) {
      toast.info('필수 입력 항목 또는 형식을 확인해주세요.');
      return false;
    }

    showLoading();
    try {
      const requestData = {
        registrationNumber: formData.registrationNumber,
        modelYear: formData.modelYear,
        manufacturer: formData.manufacturer,
        modelName: formData.modelName,
        batteryVoltage: formData.batteryVoltage.toString(),
        fuelType: formData.fuelType,
        transmissionType: formData.transmissionType,
        memo: formData.memo,
      };

      await registerVehicle(requestData);
      toast.success('저장되었습니다.');
      return true;
    } catch (error: unknown) {
      if (error instanceof APIError) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === DUPLICATE_REGISTRATION_NUMBER_CODE) {
          setErrors(prev => ({ ...prev, registrationNumber: errorMessage }));
        } else {
          console.error('차량 등록 실패:', error);
          toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        console.error('차량 등록 실패:', error);
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      }
      return false;
    } finally {
      hideLoading();
    }
  }, [formData, validateForm, showLoading, hideLoading]);

  /**
   * 폼 데이터와 에러 상태를 초기값으로 리셋합니다.
   * 주로 폼 제출 성공 후 또는 팝업/모달 닫기 시 호출됩니다.
   */
  const resetForm = useCallback(() => {
    setFormData({
      registrationNumber: '',
      modelYear: '',
      manufacturer: '',
      modelName: '',
      batteryVoltage: '',
      fuelType: '',
      transmissionType: '',
      memo: '',
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
