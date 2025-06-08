import api from '@/libs/axios';
import type { RentalListRequest, RentalListResponse } from '../types';
import { CODE_SUCCESS, type CommonResponse } from '@/utils/response';

// --- API 함수 정의 ---

/**
 * 예약 목록을 조회하는 API 함수입니다.
 * @param params 조회 필터 (페이지, 사이즈, 상태, 키워드 등)
 * @returns 예약 목록 응답 데이터
 * @throws API 호출 실패 시 에러
 */
export const fetchRentals = async (params: RentalListRequest): Promise<RentalListResponse> => {
  const response = await api.get<CommonResponse<RentalListResponse>>('/api/v1/rentals', {
    params,
  });
  if (response.data.code !== CODE_SUCCESS) {
    throw new Error(response.data.message);
  }
  return response.data.data;
};
