import api from '@/libs/axios';
import { CODE_SUCCESS, type CommonResponse } from '@/utils/response';
import type {
  DrivingLogListRequest,
  DrivingLogListResponse
} from '../types';

export const fetchDrivingLogs = async (
  params: DrivingLogListRequest
): Promise<DrivingLogListResponse> => {
  const response = await api.get<CommonResponse<DrivingLogListResponse>>('/api/v1/logs/drive', {
    params,
  });

  if (response.data.code !== CODE_SUCCESS) {
    throw new Error(response.data.message);
  }

  return response.data.data;
};