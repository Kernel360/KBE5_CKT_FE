/**
 * vehicle 에서 사용하는 타입을 정의하는 파일입니다.
 */
import type { TableHeader } from '@/components/ui/table/table/types';
import type { DropdownOption } from '@/components/ui/input/dropdown/types';

// --- 차량 등록 폼 관련 타입 ---

/**
 * 차량 등록 폼의 데이터 구조를 정의합니다.
 */
export interface VehicleFormData {
  registrationNumber: string;
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage: string;
  fuelType: string;
  transmissionType: string;
  memo: string;
}

/**
 * 차량 등록 폼의 유효성 검사 에러 메시지 구조를 정의합니다.
 */
export interface VehicleFormErrors {
  registrationNumber?: string;
  modelYear?: string;
  manufacturer?: string;
  modelName?: string;
  batteryVoltage?: string;
  fuelType?: string;
  transmissionType?: string;
  memo?: string;
}

/**
 * `useVehicleRegister` 훅이 반환하는 객체의 타입을 정의합니다.
 */
export interface UseVehicleRegisterReturn {
  formData: VehicleFormData;
  errors: VehicleFormErrors;
  handleInputChange: (id: keyof VehicleFormData, value: string) => void;
  handleSubmit: () => Promise<boolean>;
  resetForm: () => void;
}

/**
 * `useDetailPanel` 훅이 반환하는 객체의 타입을 정의합니다.
 */
export interface UseDetailPanelReturn {
  selectedItem: Vehicle | null;
  geoAddress: string | null;
  formData: VehicleUpdateFormData;
  errors: VehicleUpdateFormErrors;
  openPanel: (id: number) => void;
  closePanel: () => void;
  isLoadingDetail: boolean;
  handleInputChange: (id: keyof VehicleUpdateFormData, value: string) => void;
  initForm: (item: Vehicle) => void;
  resetForm: () => void;
  handleUpdateVehicle: () => Promise<boolean>;
  handleDeleteVehicle: () => Promise<boolean>;
}

// --- 차량 수정 폼 관련 타입 ---

/**
 * 차량 수정 폼의 데이터 구조를 정의합니다.
 */
export interface VehicleUpdateFormData {
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage: string;
  fuelType: string;
  transmissionType: string;
  memo: string;
}

/**
 * 차량 수정 폼의 유효성 검사 에러 메시지 구조를 정의합니다.
 */
export interface VehicleUpdateFormErrors {
  modelYear?: string;
  manufacturer?: string;
  modelName?: string;
  batteryVoltage?: string;
  fuelType?: string;
  transmissionType?: string;
  memo?: string;
}

// --- 테이블 헤더 정의 ---

/**
 * 차량 목록 테이블의 헤더 구성을 정의합니다.
 */
export const VEHICLE_TABLE_HEADERS: TableHeader<VehicleSummary>[] = [
  { label: '차량 번호', key: 'registrationNumber', width: '17%', align: 'center' },
  { label: '제조사', key: 'manufacturer', width: '17%', align: 'center' },
  { label: '모델', key: 'modelName', width: '17%', align: 'center' },
  { label: '연식', key: 'modelYear', width: '10%', align: 'center' },
  { label: '연료 타입', key: 'fuelTypeName', width: '14%', align: 'center' },
  { label: '특이사항', key: 'memo', width: 'auto', align: 'left' },
];

// --- 드롭다운 옵션 정의 ---

/**
 * 차량 상태 필터링을 위한 드롭다운 옵션입니다.
 */
export const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: '전체' },
  { value: 'AVAILABLE', label: '대여 가능' },
  { value: 'RENTED', label: '대여중' },
  { value: 'INACTIVE', label: '비활성화' },
];

/**
 * 연료 유형 선택을 위한 드롭다운 옵션입니다.
 */
export const FUEL_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'GASOLINE', label: '가솔린' },
  { value: 'DIESEL', label: '디젤' },
  { value: 'ELECTRIC', label: '전기' },
  { value: 'HYBRID', label: '하이브리드' },
  { value: 'LPG', label: 'LPG' },
];

/**
 * 변속기 유형 선택을 위한 드롭다운 옵션입니다.
 */
export const TRANSMISSION_TYPE_OPTIONS: DropdownOption[] = [
  { value: 'AUTOMATIC', label: '자동' },
  { value: 'MANUAL', label: '수동' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DCT', label: 'DCT' },
];

// --- API 통신을 위한 타입 정의 ---

/**
 * 차량 목록 조회 요청 (Request)의 인터페이스입니다.
 */
export interface VehicleListRequest {
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
}

/**
 * 차량 목록 조회 응답 (Response)의 인터페이스입니다.
 */
export interface VehicleListResponse {
  list: VehicleSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * 차량 목록의 각 요소 (요약 정보)에 대한 인터페이스입니다.
 */
export interface VehicleSummary {
  id: number;
  registrationNumber: string;
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage: string;
  fuelType: string;
  fuelTypeName: string;
  transmissionType: string;
  transmissionTypeName: string;
  status: string;
  statusName: string;
  memo: string;
}

/**
 * 차량 등록 요청 (Request)의 인터페이스입니다.
 */
export interface RegisterVehicleRequest {
  registrationNumber: string;
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage: string;
  fuelType: string;
  transmissionType: string;
  memo: string;
}

/**
 * 차량 등록 응답 (Response)의 인터페이스입니다.
 */
export interface RegisterVehicleResponse {
  id: number;
}

/**
 * 단일 차량의 상세 정보 인터페이스입니다.
 */
export interface Vehicle {
  id: number;
  registrationNumber: string;
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage?: string;
  fuelType: string;
  fuelTypeName: string;
  transmissionType: string;
  transmissionTypeName: string;
  status: string;
  statusName: string;
  lat?: number;
  lon?: number;
  memo?: string;
}

/**
 * 차량 수정 요청 (Request)의 인터페이스입니다.
 */
export interface UpdateVehicleRequest {
  modelYear: string;
  manufacturer: string;
  modelName: string;
  batteryVoltage: string;
  fuelType: string;
  transmissionType: string;
  memo: string;
}

/**
 * 차량 수정 응답 (Response)의 인터페이스입니다.
 */
export interface UpdateVehicleResponse {
  id: number;
}
