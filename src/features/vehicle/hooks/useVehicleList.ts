import { useState, useCallback, useEffect, useMemo } from 'react';
import type { VehicleSummary } from '../types';
import { fetchVehicles } from '../api/vehicle-api';
import debounce from 'lodash.debounce';

// --- 인터페이스 정의 ---

// 차량 목록 필터 상태를 정의합니다.
interface VehicleListFilters {
  status: string; // 차량 상태 (예: 'ACTIVE', 'INACTIVE')
  keyword: string; // 검색어 (차량번호, 모델명 등)
}

// 훅 호출 시 전달할 수 있는 옵션들을 정의합니다.
// Partial<VehicleListFilters>를 통해 필터는 선택적으로 넘길 수 있습니다.
type UseVehicleListOptions = Partial<VehicleListFilters> & {
  page?: number; // 초기 페이지 번호
  itemsPerPage?: number; // 페이지당 항목 수
};

// useVehicleList 훅이 반환하는 결과물의 타입을 정의합니다.
interface UseVehicleListResult {
  isLoading: boolean; // 데이터 로딩 중인지 여부
  error: string | null; // 에러 메시지 (없으면 null)

  vehicles: VehicleSummary[]; // 불러온 차량 목록 데이터
  totalCount: number; // 전체 차량 개수
  totalPages: number; // 전체 페이지 수

  itemsPerPage: number; // 현재 설정된 페이지당 항목 수
  currentPage: number; // 현재 페이지 번호
  filters: VehicleListFilters; // 현재 적용된 필터 상태

  // 상태를 업데이트하는 함수들
  setFilters: (newFilters: UseVehicleListOptions) => void; // 필터 업데이트 (자동으로 1페이지로 이동)
  setCurrentPage: (page: number) => void; // 현재 페이지 설정
  setItemsPerPage: (items: number) => void; // 페이지당 항목 수 설정
  refetch: (options?: { page?: number; filters?: UseVehicleListOptions }) => void; // 데이터를 수동으로 다시 불러오는 함수
}

// --- 상수 정의 ---
const DEFAULT_ITEMS_PER_PAGE = 10; // 기본 페이지당 항목 수
const DEBOUNCE_DELAY = 400;

// --- useVehicleList 커스텀 훅 정의 ---
/**
 * 차량 목록 데이터를 가져오고 관리하는 커스텀 훅입니다.
 * 필터링, 페이지네이션, 로딩 및 에러 상태를 제공합니다.
 *
 * @param options 초기 필터, 페이지, 페이지당 항목 수 설정 (선택 사항)
 * @returns UseVehicleListResult 객체
 */
export const useVehicleList = (options?: UseVehicleListOptions): UseVehicleListResult => {
  const [currentPage, setCurrentPage] = useState(options?.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(options?.itemsPerPage || DEFAULT_ITEMS_PER_PAGE);
  const [filters, setFiltersState] = useState<VehicleListFilters>({
    status: options?.status || '',
    keyword: options?.keyword || '',
  });

  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 콜백 함수 정의 ---

  /**
   * 현재 페이지를 설정합니다. (외부 노출용)
   * @param page 설정할 페이지 번호
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * 차량 데이터를 다시 불러옵니다.
   * 필요에 따라 페이지 또는 필터 옵션을 오버라이드할 수 있습니다.
   * @param options 데이터 요청 시 사용할 페이지 및 필터 옵션 (선택 사항)
   */
  const refetch = useCallback(
    async (options?: { page?: number; filters?: UseVehicleListOptions }) => {
      setIsLoading(true);
      setError(null);

      try {
        // 요청할 페이지 번호 계산 (API는 0-based 인덱스를 사용할 수 있으므로 -1)
        const pageToFetch = (options?.page !== undefined ? options.page : currentPage) - 1;
        const filtersToApply = { ...filters, ...(options?.filters || {}) };

        // API 호출
        const response = await fetchVehicles({
          ...filtersToApply,
          page: pageToFetch,
          size: itemsPerPage,
        });

        const convertList = response.list.map((item: VehicleSummary) => {
          return {
            ...item,
            batteryVoltage: item.batteryVoltage ? `${item.batteryVoltage} kWh` : '',
          };
        });

        // 성공적으로 데이터를 불러오면 상태 업데이트
        setVehicles(convertList);
        setTotalCount(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (err) {
        // 에러 발생 시 에러 상태 업데이트 및 데이터 초기화
        setError('차량 정보를 불러오는 데 실패했습니다.');
        console.error('Error fetching vehicles:', err);

        setVehicles([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, itemsPerPage]
  );

  const debouncedFetch = useMemo(
    () =>
      debounce((keyword: string) => {
        console.log(keyword);
        refetch({ filters: { keyword }, page: 1 });
      }, DEBOUNCE_DELAY),
    [refetch]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  /**
   * 필터 상태를 업데이트하고 페이지를 1로 리셋합니다.
   * @param newFilters 새로 적용할 필터 객체 (부분 업데이트 가능)
   */
  const setFilters = useCallback(
    (newFilters: UseVehicleListOptions) => {
      setFiltersState(prevFilters => {
        const merged = { ...prevFilters, ...newFilters };

        if ('keyword' in newFilters) {
          //keyword 필터 변경 → 디바운스 호출
          debouncedFetch(newFilters.keyword || '');
        } else {
          //다른 필터 변경 → 즉시 refetch
          refetch({ filters: merged, page: 1 });
        }

        return merged;
      });

      // 🔸 페이지를 1로 초기화
      setCurrentPage(1);
    },
    [debouncedFetch, refetch]
  );

  // --- useEffect: 초기 데이터 로딩 시 데이터 재요청 ---
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    isLoading,
    error,
    vehicles,
    totalCount,
    totalPages,
    itemsPerPage,
    currentPage,
    filters,
    setFilters,
    setCurrentPage: setPage,
    setItemsPerPage,
    refetch,
  };
};
