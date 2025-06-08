import { useCallback, useEffect, useState } from 'react';
import type { RentalSummary } from '../types';
import { fetchRentals } from '../api/rental-api';
import { endOfDay, formatDateTime, formatLocalDateTime, startOfDay } from '@/utils/date';

// --- 인터페이스 정의 ---

// 예약 목록 필터 상태를 정의합니다.
interface RentalListFilters {
  status: string;
  keyword: string;
  startAt: Date | null;
  endAt: Date | null;
}

// 훅 호출 시 전달할 수 있는 옵션들을 정의합니다.
// Partial<RentalListFilters>를 통해 필터는 선택적으로 넘길 수 있습니다.
type UseRentalListOptions = Partial<RentalListFilters> & {
  page?: number; // 초기 페이지 번호
  itemsPerPage?: number; // 페이지당 항목 수
};

// useRentaleList 훅이 반환하는 결과물의 타입을 정의합니다.
interface UseRentalListResult {
  isLoading: boolean; // 데이터 로딩 중인지 여부
  error: string | null; // 에러 메시지 (없으면 null)

  rentals: RentalSummary[]; // 불러온 예약 목록 데이터
  totalCount: number; // 전체 예약 개수
  totalPages: number; // 전체 페이지 수

  itemsPerPage: number; // 현재 설정된 페이지당 항목 수
  currentPage: number; // 현재 페이지 번호
  filters: RentalListFilters; // 현재 적용된 필터 상태

  // 상태를 업데이트하는 함수들
  setFilters: (newFilters: UseRentalListOptions) => void; // 필터 업데이트 (자동으로 1페이지로 이동)
  setCurrentPage: (page: number) => void; // 현재 페이지 설정
  setItemsPerPage: (items: number) => void; // 페이지당 항목 수 설정
  refetch: (options?: { page?: number; filters?: UseRentalListOptions }) => void; // 데이터를 수동으로 다시 불러오는 함수
}

// --- 상수 정의 ---
const DEFAULT_ITEMS_PER_PAGE = 10; // 기본 페이지당 항목 수

// --- useRentaleList 커스텀 훅 정의 ---
/**
 * 예약 목록 데이터를 가져오고 관리하는 커스텀 훅입니다.
 * 필터링, 페이지네이션, 로딩 및 에러 상태를 제공합니다.
 *
 * @param options 초기 필터, 페이지, 페이지당 항목 수 설정 (선택 사항)
 * @returns useRentaleListResult 객체
 */
export const useRentalList = (options?: UseRentalListOptions): UseRentalListResult => {
  const [currentPage, setCurrentPage] = useState(options?.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(options?.itemsPerPage || DEFAULT_ITEMS_PER_PAGE);
  const [filters, setFiltersState] = useState<RentalListFilters>({
    status: options?.status || '',
    keyword: options?.keyword || '',
    startAt: options?.startAt || null,
    endAt: options?.endAt || null,
  });

  const [rentals, setRentals] = useState<RentalSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 콜백 함수 정의 ---

  /**
   * 필터 상태를 업데이트하고 페이지를 1로 리셋합니다.
   * @param newFilters 새로 적용할 필터 객체 (부분 업데이트 가능)
   */
  const setFilters = useCallback((newFilters: UseRentalListOptions) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1);
  }, []);

  /**
   * 현재 페이지를 설정합니다. (외부 노출용)
   * @param page 설정할 페이지 번호
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * 예약 데이터를 다시 불러옵니다.
   * 필요에 따라 페이지 또는 필터 옵션을 오버라이드할 수 있습니다.
   * @param options 데이터 요청 시 사용할 페이지 및 필터 옵션 (선택 사항)
   */
  const refetch = useCallback(
    async (options?: { page?: number; filters?: UseRentalListOptions }) => {
      setIsLoading(true);
      setError(null);

      try {
        // 요청할 페이지 번호 계산 (API는 0-based 인덱스를 사용할 수 있으므로 -1)
        const pageToFetch = (options?.page !== undefined ? options.page : currentPage) - 1;
        const filtersToApply = { ...filters, ...(options?.filters || {}) };
        console.log('filtersToApply > ', filtersToApply);

        // API 호출
        const response = await fetchRentals({
          ...filtersToApply,
          startAt:
            filtersToApply.startAt instanceof Date ? formatDateTime(startOfDay(filtersToApply.startAt)) : undefined,
          endAt: filtersToApply.endAt instanceof Date ? formatDateTime(endOfDay(filtersToApply.endAt)) : undefined,
          page: pageToFetch,
          size: itemsPerPage,
        });

        // 성공적으로 데이터를 불러오면 상태 업데이트
        setRentals(prepareRentalListForDisplay(response.list));
        setTotalCount(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (err) {
        // 에러 발생 시 에러 상태 업데이트 및 데이터 초기화
        setError('예약 정보를 불러오는 데 실패했습니다.');
        console.error('Error fetching vehicles:', err);

        setRentals([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, currentPage, itemsPerPage]
  );

  // --- useEffect: 초기 데이터 로딩 시 데이터 재요청 ---
  useEffect(() => {
    refetch();
  }, [refetch]);

  const prepareRentalListForDisplay = (list: RentalSummary[]) => {
    return list.map((item: RentalSummary) => {
      return {
        ...item,
        pickupAt: formatLocalDateTime(item.pickupAt),
        returnAt: formatLocalDateTime(item.pickupAt),
        memo: item.memo ?? '',
      };
    });
  };

  return {
    isLoading,
    error,
    rentals,
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
