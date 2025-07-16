import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useLoading } from '@/context/LoadingContext';

import { getVehicleDetail, updateVehicle, deleteVehicle } from '../api/vehicle-api';
import type { Vehicle, VehicleUpdateFormData, VehicleUpdateFormErrors } from '../types';
import type { UseDetailPanelReturn } from '../types';
import { APIError } from '@/utils/response';
import { DUPLICATE_REGISTRATION_NUMBER_CODE } from '../errors';

/**
 * 차량 상세 정보 패널의 데이터 로딩, 상태 관리, 수정 및 삭제 로직을 관리하는 훅입니다.
 */
export const useDetailPanel = (): UseDetailPanelReturn => {
  // --- 상태 관리 ---
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Vehicle | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { showLoading, hideLoading } = useLoading();

  // --- 폼 데이터 상태 관리 ---
  // 차량 수정 폼의 모든 입력 필드 값을 저장합니다. 초기값은 빈 문자열입니다.
  const [formData, setFormData] = useState<VehicleUpdateFormData>({
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
  const [errors, setErrors] = useState<VehicleUpdateFormErrors>({});

  // --- 패널 제어 핸들러 ---

  /**
   * 상세 정보 패널을 열고, 조회할 차량의 ID를 설정합니다.
   */
  const openPanel = useCallback((id: number) => {
    setSelectedItemId(id);
  }, []);

  /**
   * 상세 정보 패널을 닫고 관련 상태를 초기화합니다.
   */
  const closePanel = useCallback(() => {
    setSelectedItemId(null);
    setSelectedItem(null);
  }, []);

  // --- 상세 정보 데이터 로딩 ---
  useEffect(() => {
    const fetchDetail = async () => {
      if (selectedItemId === null) {
        setSelectedItem(null);
        return;
      }

      setIsLoadingDetail(true);

      try {
        const data = await getVehicleDetail(selectedItemId);
        setSelectedItem(data);
      } catch (error) {
        console.error('차량 상세 조회 실패:', error);

        closePanel();
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedItemId, closePanel]);

  /**
   * 입력 필드의 값이 변경될 때 호출되는 핸들러 함수입니다.
   * 해당 필드의 `formData` 값을 업데이트하고, 해당 필드의 기존 에러 메시지를 제거합니다.
   * @param id 변경된 입력 필드의 ID (즉, `formData` 객체의 키)
   * @param value 변경된 입력 필드의 새 값
   */
  const handleInputChange = useCallback((id: keyof VehicleUpdateFormData, value: string) => {
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
    const newErrors: VehicleUpdateFormErrors = {};

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
   * 폼 유효성 검사를 먼저 수행하고, 유효한 경우 차량 수정 API를 호출합니다.
   * API 호출 전후로 로딩 스피너를 표시하며, 성공/실패 시 사용자에게 토스트 알림을 제공합니다.
   * @returns 수정 작업의 성공 여부를 나타내는 `boolean` 값
   */
  const handleUpdateVehicle = useCallback(async () => {
    if (selectedItemId === null) {
      closePanel();
      toast.error('존재하지 않는 차량입니다.');
      return false;
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.info('필수 입력 항목 또는 형식을 확인해주세요.');
      return false;
    }

    showLoading();
    try {
      const requestData = {
        modelYear: formData.modelYear,
        manufacturer: formData.manufacturer,
        modelName: formData.modelName,
        batteryVoltage: formData.batteryVoltage.toString(),
        fuelType: formData.fuelType,
        transmissionType: formData.transmissionType,
        memo: formData.memo,
      };

      await updateVehicle(selectedItemId, requestData);
      toast.success('저장되었습니다.');
      return true;
    } catch (error: unknown) {
      if (error instanceof APIError) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === DUPLICATE_REGISTRATION_NUMBER_CODE) {
          setErrors(prev => ({ ...prev, registrationNumber: errorMessage }));
        } else {
          console.error('차량 수정 실패:', error);
          toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        console.error('차량 수정 실패:', error);
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      }
      return false;
    } finally {
      hideLoading();
    }
  }, [formData, validateForm, showLoading, hideLoading, closePanel, selectedItemId]);

  // --- 차량 삭제 핸들러 ---
  const handleDeleteVehicle = useCallback(async (): Promise<boolean> => {
    if (selectedItemId === null) {
      closePanel();
      toast.error('존재하지 않는 차량입니다.');
      return false;
    }

    showLoading();
    try {
      await deleteVehicle(selectedItemId);
      setSelectedItem(null);
      setSelectedItemId(null);
      toast.success('삭제되었습니다.');
      return true;
    } catch (error: unknown) {
      console.error('차량 삭제 실패:', error);

      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      hideLoading();
    }
  }, [selectedItemId, showLoading, hideLoading, closePanel]);

  /**
   * 폼 데이터 초기화
   *
   */
  const initForm = useCallback((item: Vehicle) => {
    setFormData({
      modelYear: item.modelYear,
      manufacturer: item.manufacturer,
      modelName: item.modelName,
      batteryVoltage: item.batteryVoltage ?? '',
      fuelType: item.fuelType,
      transmissionType: item.transmissionType,
      memo: item.memo ?? '',
    });
    setErrors({});
  }, []);

  /**
   * 폼 데이터와 에러 상태를 초기값으로 리셋합니다.
   * 주로 폼 제출 성공 후 또는 팝업/모달 닫기 시 호출됩니다.
   */
  const resetForm = useCallback(() => {
    setFormData({
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
    selectedItem,
    formData,
    errors,
    openPanel,
    closePanel,
    isLoadingDetail,
    handleInputChange,
    handleUpdateVehicle,
    handleDeleteVehicle,
    initForm,
    resetForm,
  };
};
