import type { TableHeader } from '@/components/ui/table/table/types';
import type { DropdownOption } from '@/components/ui/input/dropdown/types';

export interface DrivingLogSummary {
  id: number;
  modelName: string;
  registrationNumber: string;
  startAt: Date;
  endAt: Date;
  startOdometer: number;
  endOdometer: number;
  totalDistance: number;
  user: string;
  drivingType: string;
  drivingTypeName: string;
  memo: string;
}

export const DRIVINGLOG_TABLE_HEADERS: TableHeader<DrivingLogSummary>[] = [
  { label: '번호', key: 'id', width: '60px', align: 'center' },
  { label: '모델', key: 'VehicleModelName', width: '9%', align: 'center' },
  { label: '차량 번호', key: 'VehicleRegistrationNumber', width: '9%', align: 'center' },
  { label: '시작 시간', key: 'startAtFormatted', width: '12%', align: 'center' },
  { label: '종료 시간', key: 'endAtFormatted', width: '12%', align: 'center' },
  { label: '출발 계기판', key: 'startOdometer', width: '8%', align: 'center' },
  { label: '도착 계기판', key: 'endOdometer', width: '8%', align: 'center' },
  { label: '총 주행거리', key: 'totalDistance', width: '8%', align: 'center' },
  { label: '사용자', key: 'customerName', width: '8%', align: 'center' },
  {
    label: '운행 유형',
    key: 'drivingType',
    width: '9%',
    type: 'badge',
    displayKey: 'drivingTypeName',
    valueToBadgeColorMap: {
      FOR_BUSINESS_USE: 'green',
      FOR_COMMUTING: 'red',
      NOT_REGISTERED: 'gray',
    },
  },
  { label: '비고', key: 'memo', width: 'auto', align: 'center' },
];

export const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: '전체' },
  { value: 'FOR_BUSINESS_USE', label: '업무용' },
  { value: 'FOR_COMMUTING', label: '출퇴근용' },
  { value: 'NOT_REGISTERED', label: '미등록' },
];

export interface DrivingLogListRequest {
  page?: number;
  size?: number;
  vehicleNumber?: string;
  userName?: string;
  drivingType?: string;
  startDate?: string;  // ISO 문자열
  endDate?: string;
}

export interface DrivingLogSummaryExtended extends DrivingLogSummary {
  startAtFormatted: string;
  endAtFormatted: string;
  drivingTypeName: string;
}

export interface DrivingLogListResponse {
  list: DrivingLogSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}