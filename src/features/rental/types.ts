// --- 드롭다운 옵션 정의 ---

import type { DropdownOption } from '@/components/ui/input/dropdown/types';
import type { TableHeader } from '@/components/ui/table/table/types';

// --- 예약 등록 폼 관련 타입 ---

/**
 * 예약 등록 폼의 데이터 구조를 정의합니다.
 */
export interface RentalFormData {
  vehicle: SearchVehicleSummary | null;
  customer: SearchCustomerSummary | null;
  pickupAt: Date | null;
  returnAt: Date | null;
  memo: string;
}

/**
 * 예약 등록 폼의 유효성 검사 에러 메시지 구조를 정의합니다.
 */
export interface RentalFormErrors {
  vehicle?: string;
  customer?: string;
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
  handleInputChange: (id: keyof RentalFormData, value: unknown) => void;
  handleSubmit: () => Promise<boolean>;
  resetForm: () => void;
  isAvailableVehicleSearch: () => boolean;
}

/**
 * `useDetailPanel` 훅이 반환하는 객체의 타입을 정의합니다.
 */
export interface UseDetailPanelReturn {
  selectedItem: Rental | null;
  formData: RentalUpdateFormData;
  errors: RentalUpdateFormErrors;
  openPanel: (id: number) => void;
  closePanel: () => void;
  isLoadingDetail: boolean;
  handleInputChange: (id: keyof RentalUpdateFormData, value: unknown) => void;
  initForm: (item: Rental) => void;
  resetForm: () => void;
  handleUpdateRental: () => Promise<boolean>;
  handleUpdateRentalStatus: (status: string) => Promise<boolean>;
  isAvailableVehicleSearch: () => boolean;
  isStatusPending: () => boolean;
  isStatusRented: () => boolean;
}

// --- 예약 수정 폼 관련 타입 ---

/**
 * 예약 수정 폼의 데이터 구조를 정의합니다.
 */
export interface RentalUpdateFormData {
  pickupAt: Date | null;
  returnAt: Date | null;
  vehicle: SearchVehicleSummary | null;
  customer: SearchCustomerSummary | null;
  memo: string;
}

/**
 * 예약 수정 폼의 유효성 검사 에러 메시지 구조를 정의합니다.
 */
export interface RentalUpdateFormErrors {
  pickupAt?: string;
  returnAt?: string;
  vehicle?: string;
  customer?: string;
  memo?: string;
}

// --- 테이블 헤더 정의 ---
/**
 * 예약 목록 테이블의 헤더 구성을 정의합니다.
 */
export const RENTAL_TABLE_HEADERS: TableHeader<RentalSummary>[] = [
  { label: '번호', key: 'id', width: '6%', align: 'center' },
  { label: '고객명', key: 'customerName', width: '12%', align: 'center' },
  { label: '고객 전화번호', key: 'customerPhoneNumber', width: '15%', align: 'center' },
  { label: '차량 번호', key: 'vehicleRegistrationNumber', width: '15%', align: 'center' },
  { label: '픽업 일시', key: 'pickupAt', width: '20%', align: 'center' },
  { label: '반납 일시', key: 'returnAt', width: '20%', align: 'center' },
  {
    label: '예약 상태',
    key: 'rentalStatus',
    width: 'auto',
    type: 'badge',
    displayKey: 'rentalStatusName',
    valueToBadgeColorMap: {
      PENDING: 'gray',
      RENTED: 'orange',
      RETURNED: 'green',
      CANCELED: 'red',
    },
  },
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

/**
 * 예약 저장 요청 (Request)의 인터페이스입니다.
 */
export interface RegisterRentalRequest {
  pickupAt: string;
  returnAt: string;
  customerId: number;
  vehicleId: number;
  memo: string;
}

/**
 * 예약 저장 응답 (Response)의 인터페이스입니다.
 */
export interface RegisterRentalResponse {
  id: number;
}

/**
 * 고객 검색 응답 (Response)의 인터페이스입니다.
 */
export interface SearchCustomerResponse {
  list: SearchCustomerSummary[];
}

/**
 * 고객 검색 DTO 인터페이스입니다.
 */
export interface SearchCustomerSummary {
  id: number;
  customerName: string;
  phoneNumber: string;
  email: string;
}

/**
 * 차량 검색 응답 (Response)의 인터페이스입니다.
 */
export interface SearchVehicleResponse {
  list: SearchVehicleSummary[];
}

/**
 * 차량 검색 DTO 인터페이스입니다.
 */
export interface SearchVehicleSummary {
  id: number;
  registrationNumber: string;
  modelName: string;
  modelYear: string;
  manufacturer: string;
  fuelType: string;
}

/**
 * 단일 차량의 상세 정보 인터페이스입니다.
 */
export interface Rental {
  id: number;
  rentalStatus: string;
  rentalStatusName: string;
  pickupAt: string;
  returnAt: string;
  customer: SearchCustomerSummary;
  vehicle: SearchVehicleSummary;
  memo: string;
}

/**
 * 예약 수정 요청 (Request)의 인터페이스입니다.
 */
export interface UpdateRentalRequest {
  pickupAt: string;
  returnAt: string;
  customerId: number;
  vehicleId: number;
  memo: string;
}

/**
 * 예약 메모 수정 요청 (Request)의 인터페이스입니다.
 */
export interface UpdateRentalMemoRequest {
  memo: string;
}

/**
 * 예약 수정 응답 (Response)의 인터페이스입니다.
 */
export interface UpdateRentalResponse {
  id: number;
}

/**
 * 예약 메모 수정 요청 (Request)의 인터페이스입니다.
 */
export interface UpdateRentalStatusRequest {
  status: string;
}

/**
 * 예약 수정 응답 (Response)의 인터페이스입니다.
 */
export interface UpdateRentalStatusResponse {
  id: number;
  rentalStatus: string;
  rentalStatusName: string;
}

/**
 * 예약 상태 정의
 */
export const RENTAL_STATUS_PEDING = 'PENDING';
export const RENTAL_STATUS_RENTED = 'RENTED';
export const RENTAL_STATUS_RETURNED = 'RETURNED';
export const RENTAL_STATUS_CANCELED = 'CANCELED';
