import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useLoading } from '@/context/LoadingContext';
import { APIError } from '@/utils/response';
import { formatDateTime, getDateTime, isBefore } from '@/utils/date';

import {
  RENTAL_STATUS_CANCELED,
  RENTAL_STATUS_PEDING,
  RENTAL_STATUS_RENTED,
  RENTAL_STATUS_RETURNED,
  type Rental,
  type RentalUpdateFormData,
  type RentalUpdateFormErrors,
  type UseDetailPanelReturn,
} from '../types';
import { getRentalDetail, updateRental, updateRentalMemo, updateRentalStatus } from '../api/rental-api';
import { useConfirm } from '@/hooks/useConfirm';

/**
 * 예약 상세 정보 패널의 데이터 로딩, 상태 관리, 수정 및 삭제 로직을 관리하는 훅입니다.
 */
export const useDetailPanel = (): UseDetailPanelReturn => {
  // --- 상태 관리 ---
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Rental | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { confirm } = useConfirm();

  // --- 폼 데이터 상태 관리 ---
  // 예약 수정 폼의 모든 입력 필드 값을 저장합니다. 초기값은 빈 문자열입니다.
  const [formData, setFormData] = useState<RentalUpdateFormData>({
    vehicle: null,
    customer: null,
    pickupAt: null,
    returnAt: null,
    memo: '',
  });

  // --- 폼 에러 상태 관리 ---
  // 각 입력 필드에 대한 유효성 검사 에러 메시지를 저장합니다.
  const [errors, setErrors] = useState<RentalUpdateFormErrors>({});

  // --- 내부 함수 ---
  const validateDateRange = useCallback((currentFormData: RentalUpdateFormData) => {
    const newErrors: RentalUpdateFormErrors = {};
    if (currentFormData.pickupAt && currentFormData.returnAt) {
      const today = new Date();
      if (isBefore(currentFormData.pickupAt, today)) {
        newErrors.pickupAt = '픽업 시간은 오늘보다 이후여야 합니다.';
      }

      if (isBefore(currentFormData.returnAt, today)) {
        newErrors.returnAt = '반납 시간은 오늘보다 이후여야 합니다.';
      }

      if (isBefore(currentFormData.returnAt, currentFormData.pickupAt)) {
        newErrors.returnAt = '반납 시간은 픽업 시간보다 이후여야 합니다.';
      }
    }
    return newErrors;
  }, []);

  // --- 조건 ---
  const isAvailableVehicleSearch = (): boolean => {
    return !!formData.pickupAt && !!formData.returnAt && !errors.pickupAt && !errors.returnAt;
  };

  const isStatusPending = useCallback(
    (): boolean => selectedItem?.rentalStatus === RENTAL_STATUS_PEDING,
    [selectedItem]
  );
  const isStatusRented = useCallback(
    (): boolean => selectedItem?.rentalStatus === RENTAL_STATUS_RENTED,
    [selectedItem]
  );

  // --- 패널 제어 핸들러 ---

  /**
   * 상세 정보 패널을 열고, 조회할 예약의 ID를 설정합니다.
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
        const data = await getRentalDetail(selectedItemId);
        setSelectedItem(data);
      } catch (error) {
        if (error instanceof APIError) {
          const errorMessage = error.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
          console.error('예약 상세 조회 실패:', errorMessage);
          toast.error(errorMessage);
        } else {
          console.error('예약 상세 조회 실패:', error);
          toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        }
        closePanel();
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
  const handleInputChange = useCallback((id: keyof RentalUpdateFormData, value: unknown) => {
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
    const newErrors: RentalUpdateFormErrors = {};

    if (!isStatusPending()) {
      setErrors(newErrors);
      return isValid;
    }

    // 픽업 시간 필드의 유효성 검사
    if (!formData.pickupAt) {
      newErrors.pickupAt = '픽업 시간을 선택해주세요.';
      isValid = false;
    }

    // 반납 시간 필드의 유효성 검사
    if (!formData.returnAt) {
      newErrors.returnAt = '반납 시간을 선택해주세요.';
      isValid = false;
    }

    // 픽업 및 반납 추가 유효성 검사
    const dateRangeErrors = validateDateRange(formData);
    if (dateRangeErrors.returnAt) {
      newErrors.returnAt = dateRangeErrors.returnAt;
      isValid = false;
    }

    // 고객 필드의 유효성 검사
    if (!formData.customer) {
      newErrors.customer = '고객을 선택해주세요.';
      isValid = false;
    }

    // 차량 필드의 유효성 검사
    if (!formData.vehicle) {
      newErrors.vehicle = '차량을 선택해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateDateRange, isStatusPending]);

  /**
   * 현재 예약 상태를 기반으로 예약 상태의 유효성을 검사합니다.
   * @returns 예약 상태를 변경할 수 있으면 true, 없으면 false를 반환합니다.
   */
  const validateStatus = useCallback(
    (status: string): boolean => {
      const currentStatus = selectedItem?.rentalStatus;
      if (currentStatus === RENTAL_STATUS_PEDING) {
        return status !== RENTAL_STATUS_PEDING;
      } else if (currentStatus === RENTAL_STATUS_RENTED) {
        return status === RENTAL_STATUS_RETURNED || status === RENTAL_STATUS_CANCELED;
      } else {
        return false;
      }
    },
    [selectedItem]
  );

  /**
   * 폼 제출을 처리하는 비동기 함수입니다.
   * 폼 유효성 검사를 먼저 수행하고, 유효한 경우 예약 수정 API를 호출합니다.
   * API 호출 전후로 로딩 스피너를 표시하며, 성공/실패 시 사용자에게 토스트 알림을 제공합니다.
   * @returns 수정 작업의 성공 여부를 나타내는 `boolean` 값
   */
  const handleUpdateRental = useCallback(async () => {
    if (selectedItemId === null) {
      closePanel();
      toast.error('존재하지 않는 예약입니다.');
      return false;
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.info('필수 입력 항목 또는 형식을 확인해주세요.');
      return false;
    }

    showLoading();
    try {
      if (isStatusPending()) {
        const requestData = {
          vehicleId: formData.vehicle!.id,
          customerId: formData.customer!.id,
          pickupAt: formatDateTime(formData.pickupAt, 'yyyy-MM-dd HH:mm:ss')!,
          returnAt: formatDateTime(formData.returnAt, 'yyyy-MM-dd HH:mm:ss')!,
          memo: formData.memo,
        };

        await updateRental(selectedItemId, requestData);
      } else {
        const requestData = {
          memo: formData.memo,
        };

        await updateRentalMemo(selectedItemId, requestData);
      }

      toast.success('저장되었습니다.');
      return true;
    } catch (error: unknown) {
      if (error instanceof APIError) {
        const errorMessage = error.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
        console.error('예약 수정 실패:', errorMessage);
        toast.error(errorMessage);
      } else {
        console.error('예약 수정 실패:', error);
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      }
      return false;
    } finally {
      hideLoading();
    }
  }, [formData, validateForm, isStatusPending, showLoading, hideLoading, closePanel, selectedItemId]);

  /**
   * 상태 유효성 검사를 먼저 수행하고, 유효한 경우 예약 상태 변경 API를 호출합니다.
   * API 호출 전후로 로딩 스피너를 표시하며, 성공/실패 시 사용자에게 토스트 알림을 제공합니다.
   * @returns 수정 작업의 성공 여부를 나타내는 `boolean` 값
   */
  const handleUpdateRentalStatus = useCallback(
    async (status: string) => {
      if (selectedItemId === null) {
        closePanel();
        toast.error('존재하지 않는 예약입니다.');
        return false;
      }

      const isValid = validateStatus(status);
      if (!isValid) {
        toast.info('예약 상태를 변경할 수 없습니다.');
        return false;
      }

      if (status === RENTAL_STATUS_RENTED || status === RENTAL_STATUS_RETURNED) {
        const title = status === RENTAL_STATUS_RENTED ? '예약 안내' : '반납 안내';
        const content =
          status === RENTAL_STATUS_RENTED ? '현재 시간으로 차량을 픽업합니다.' : '현재 시간으로 차량을 반납합니다.';

        const isConfirmed = await confirm({
          title,
          content,
          confirmText: '확인',
          cancelText: '취소',
        });

        if (!isConfirmed) {
          return false;
        }
      }

      showLoading();
      try {
        const requestData = {
          status,
        };

        const response = await updateRentalStatus(selectedItemId, requestData);

        setSelectedItem(prev => {
          if (prev) {
            return {
              ...prev,
              rentalStatus: response.rentalStatus,
              rentalStatusName: response.rentalStatusName,
              pickupAt: response.pickupAt,
              returnAt: response.returnAt,
            };
          }
          return prev;
        });

        toast.success('예약 상태가 변경되었습니다.');
        return true;
      } catch (error: unknown) {
        if (error instanceof APIError) {
          const errorMessage = error.message ?? '오류가 발생했습니다. 다시 시도해주세요.';
          console.error('예약 상태 변경 실패:', errorMessage);
          toast.error(errorMessage);
        } else {
          console.error('예약 상태 변경 실패:', error);
          toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        }
        return false;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading, closePanel, selectedItemId, validateStatus]
  );

  /**
   * 폼 데이터 초기화
   *
   */
  const initForm = useCallback((item: Rental) => {
    setFormData({
      vehicle: item.vehicle,
      customer: item.customer,
      pickupAt: getDateTime(item.pickupAt),
      returnAt: getDateTime(item.returnAt),
      memo: item.memo,
    });
    setErrors({});
  }, []);

  /**
   * 폼 데이터와 에러 상태를 초기값으로 리셋합니다.
   * 주로 폼 제출 성공 후 또는 팝업/모달 닫기 시 호출됩니다.
   */
  const resetForm = useCallback(() => {
    setFormData({
      vehicle: null,
      customer: null,
      pickupAt: null,
      returnAt: null,
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
    handleUpdateRental,
    handleUpdateRentalStatus,
    initForm,
    resetForm,
    isAvailableVehicleSearch,
    isStatusPending,
    isStatusRented,
  };
};
