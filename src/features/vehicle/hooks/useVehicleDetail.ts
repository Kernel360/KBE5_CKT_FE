import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useLoading } from '@/context/LoadingContext';

import { getVehicleDetail, updateVehicle, deleteVehicle } from '../api/vehicle-api';
import type { Vehicle, RegisterVehicleRequest } from '../types';
import type { UseDetailPanelReturn } from '../types';

/**
 * 차량 상세 정보 패널의 데이터 로딩, 상태 관리, 수정 및 삭제 로직을 관리하는 훅입니다.
 */
export const useDetailPanel = (): UseDetailPanelReturn => {
  // --- 상태 관리 ---
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Vehicle | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { showLoading, hideLoading } = useLoading();

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

  // --- 차량 정보 업데이트 핸들러 ---
  const handleUpdateVehicle = useCallback(
    async (vehicleData: Vehicle): Promise<Vehicle | undefined> => {
      if (selectedItemId === null || vehicleData.id === undefined) {
        closePanel();
        toast.error('존재하지 않는 차량입니다.');
        return undefined;
      }

      const requestDataForApi: RegisterVehicleRequest = {
        registrationNumber: vehicleData.registrationNumber,
        modelYear: vehicleData.modelYear,
        manufacturer: vehicleData.manufacturer,
        modelName: vehicleData.modelName,
        batteryVoltage: String(vehicleData.batteryVoltage ?? ''),
        fuelType: vehicleData.fuelType,
        transmissionType: vehicleData.transmissionType,
        memo: vehicleData.memo ?? '',
      };

      showLoading();
      try {
        const updatedData = await updateVehicle(selectedItemId, requestDataForApi);
        setSelectedItem(updatedData);
        toast.success('저장되었습니다.');
        return updatedData;
      } catch (error: unknown) {
        console.error('차량 수정 실패:', error);

        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
        return undefined;
      } finally {
        hideLoading();
      }
    },
    [selectedItemId, showLoading, hideLoading, closePanel]
  );

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

  return {
    selectedItem,
    openPanel,
    closePanel,
    isLoadingDetail,
    handleUpdateVehicle,
    handleDeleteVehicle,
  };
};
