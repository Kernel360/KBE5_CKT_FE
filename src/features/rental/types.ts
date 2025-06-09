// --- 드롭다운 옵션 정의 ---

import type { DropdownOption } from '@/components/ui/input/dropdown/types';
import type { TableHeader } from '@/components/ui/table/table/types';

// --- 예약 등록 폼 관련 타입 ---

/**
 * 예약 등록 폼의 데이터 구조를 정의합니다.
 */
export interface RentalFormData {
  vehicleId: number | null;
  customerId: number | null;
  pickupAt: Date | null;
  returnAt: Date | null;
  memo: string;
}

/**
 * 예약 등록 폼의 유효성 검사 에러 메시지 구조를 정의합니다.
 */
export interface RentalFormErrors {
  vehicleId?: string;
  customerId?: string;
  pickupAt?: string;
  modelName?: string;
  returnAt?: string;
  memo?: string;
}

/**
 * `useRentalRegister` 훅이 반환하는 객체의 타입을 정의합니다.
 */
export interface UseRentalRegisterReturn {
  formData: RentalFormData;
  errors: RentalFormErrors;
  handleInputChange: (id: keyof RentalFormData, value: string) => void;
  handleSubmit: () => Promise<boolean>;
  resetForm: () => void;
}

// --- 테이블 헤더 정의 ---
/**
 * 예약 목록 테이블의 헤더 구성을 정의합니다.
 */
export const RENTAL_TABLE_HEADERS: TableHeader<RentalSummary>[] = [
  { label: '번호', key: 'id', width: '60px', align: 'center' },
  { label: '고객명', key: 'customerName', width: '8%', align: 'center' },
  { label: '고객 전화번호', key: 'customerPhoneNumber', width: '9%', align: 'center' },
  { label: '차량 번호', key: 'vehicleRegistrationNumber', width: '9%', align: 'center' },
  { label: '차량 모델명', key: 'vehicleModelName', width: '9%', align: 'center' },
  { label: '제조사', key: 'vehicleManufacture', width: '8%', align: 'center' },
  { label: '연식', key: 'vehicleModelYear', width: '6%', align: 'center' },
  {
    label: '예약 상태',
    key: 'rentalStatus',
    width: '9%',
    type: 'badge',
    displayKey: 'rentalStatusName',
    valueToBadgeColorMap: {
      PENDING: 'gray',
      RENTED: 'orange',
      RETURNED: 'green',
      CANCELED: 'red',
    },
  },
  { label: '픽업 일시', key: 'pickupAt', width: '12%', align: 'center' },
  { label: '반납 일시', key: 'returnAt', width: '12%', align: 'center' },
  { label: '비고', key: 'memo', width: 'auto', align: 'left' },
];

// --- 드롭다운 옵션 정의 ---

/**
 * 예약 상태 필터링을 위한 드롭다운 옵션입니다.
 */
export const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '예약 대기' },
  { value: 'RENTED', label: '예약 중' },
  { value: 'RETURNED', label: '반납 완료' },
  { value: 'CANCELED', label: '예약 취소' },
];

// --- API 통신을 위한 타입 정의 ---

/**
 * 차량 목록 조회 요청 (Request)의 인터페이스입니다.
 */
export interface RentalListRequest {
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
  startAt?: string;
  endAt?: string;
}

/**
 * 차량 목록 조회 응답 (Response)의 인터페이스입니다.
 */
export interface RentalListResponse {
  list: RentalSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * 예약 목록의 각 요소 (요약 정보)에 대한 인터페이스입니다.
 */
export interface RentalSummary {
  id: number;
  customerName: string;
  customerPhoneNumber: string;
  vehicleRegistrationNumber: string;
  vehicleModelName: string;
  vehicleManufacture: string;
  vehicleModelYear: string;
  rentalStatus: string;
  rentalStatusName: string;
  pickupAt: string;
  returnAt: string;
  memo: string;
}
